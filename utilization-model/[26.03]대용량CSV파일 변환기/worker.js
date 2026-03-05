// worker.js — zip.js v2.8.x + 동적 메모리 관리 + 배치 처리
// C++에서 500행 단위 배치 XML → onBatch 1회 호출 → enc.encode 1회
importScripts("zip.min.js");
importScripts("wasm/csv_xlsx.js");

let wasmModule   = null;
let moduleReady  = false;
let pendingStart = null;
let processedRows  = 0;
let baseFileName   = "";

const enc = new TextEncoder();

const CONTENT_TYPES_XML =
`<?xml version="1.0" encoding="UTF-8" standalone="yes"?>
<Types xmlns="http://schemas.openxmlformats.org/package/2006/content-types">
  <Default Extension="rels" ContentType="application/vnd.openxmlformats-package.relationships+xml"/>
  <Default Extension="xml" ContentType="application/xml"/>
  <Override PartName="/xl/workbook.xml" ContentType="application/vnd.openxmlformats-officedocument.spreadsheetml.sheet.main+xml"/>
  <Override PartName="/xl/worksheets/sheet1.xml" ContentType="application/vnd.openxmlformats-officedocument.spreadsheetml.worksheet+xml"/>
  <Override PartName="/xl/styles.xml" ContentType="application/vnd.openxmlformats-officedocument.spreadsheetml.styles+xml"/>
</Types>`;
const RELS_XML =
`<?xml version="1.0" encoding="UTF-8" standalone="yes"?>
<Relationships xmlns="http://schemas.openxmlformats.org/package/2006/relationships">
  <Relationship Id="rId1" Type="http://schemas.openxmlformats.org/officeDocument/2006/relationships/officeDocument" Target="xl/workbook.xml"/>
</Relationships>`;
const WORKBOOK_XML =
`<?xml version="1.0" encoding="UTF-8" standalone="yes"?>
<workbook xmlns="http://schemas.openxmlformats.org/spreadsheetml/2006/main"
          xmlns:r="http://schemas.openxmlformats.org/officeDocument/2006/relationships">
  <sheets><sheet name="Sheet1" sheetId="1" r:id="rId1"/></sheets>
</workbook>`;
const WORKBOOK_RELS_XML =
`<?xml version="1.0" encoding="UTF-8" standalone="yes"?>
<Relationships xmlns="http://schemas.openxmlformats.org/package/2006/relationships">
  <Relationship Id="rId1" Type="http://schemas.openxmlformats.org/officeDocument/2006/relationships/worksheet" Target="worksheets/sheet1.xml"/>
  <Relationship Id="rId2" Type="http://schemas.openxmlformats.org/officeDocument/2006/relationships/styles" Target="styles.xml"/>
</Relationships>`;
const STYLES_XML =
`<?xml version="1.0" encoding="UTF-8" standalone="yes"?>
<styleSheet xmlns="http://schemas.openxmlformats.org/spreadsheetml/2006/main">
  <numFmts count="1"><numFmt numFmtId="164" formatCode="@"/></numFmts>
  <fonts count="1"><font><sz val="11"/><name val="Calibri"/></font></fonts>
  <fills count="2">
    <fill><patternFill patternType="none"/></fill>
    <fill><patternFill patternType="gray125"/></fill>
  </fills>
  <borders count="1"><border><left/><right/><top/><bottom/><diagonal/></border></borders>
  <cellStyleXfs count="1"><xf numFmtId="0" fontId="0" fillId="0" borderId="0"/></cellStyleXfs>
  <cellXfs count="2">
    <xf numFmtId="0" fontId="0" fillId="0" borderId="0" xfId="0"/>
    <xf numFmtId="164" fontId="0" fillId="0" borderId="0" xfId="0" applyNumberFormat="1"/>
  </cellXfs>
</styleSheet>`;

const SHEET_HEADER = enc.encode(
  `<?xml version="1.0" encoding="UTF-8" standalone="yes"?>` +
  `<worksheet xmlns="http://schemas.openxmlformats.org/spreadsheetml/2006/main"` +
  ` xmlns:r="http://schemas.openxmlformats.org/officeDocument/2006/relationships">` +
  `<sheetData>`
);
const SHEET_FOOTER = enc.encode(`</sheetData></worksheet>`);

// ══════════════════════════════════════════════
// ── 동적 메모리 관리자 ──
// ══════════════════════════════════════════════
const MemMgr = {
  // Worker에서는 performance.memory가 0 반환(Chrome 버그) →
  // 메인 스레드가 주기적으로 측정해 'memFromMain' 메시지로 전달
  supported: false,          // Worker 자체 측정 비활성
  flushThreshold: 32 * 1024 * 1024,
  accumulatedBytes: 0,
  lastUsageRatio: 0,
  lastUsedMB: -1,
  lastTotalMB: -1,
  measureMode: 'main',       // 'main' | 'estimate' | 'unknown'
  // 메인 스레드에서 받은 최신 값
  mainUsedMB: -1,
  mainTotalMB: -1,
  mainRatio: -1,

  measure() {
    // Chrome/Edge: performance.memory 실측
    if (this.supported) {
      const m = performance.memory;
      // jsHeapSizeLimit이 0이면 아직 초기화 전 → 폴백
      if (m.jsHeapSizeLimit > 0 && m.usedJSHeapSize > 0) {
        const ratio = m.usedJSHeapSize / m.jsHeapSizeLimit;
        this.lastUsageRatio = ratio;
        this.lastUsedMB  = m.usedJSHeapSize / 1024 / 1024;
        this.lastTotalMB = m.jsHeapSizeLimit / 1024 / 1024;
        this.measureMode = 'heap';
        return { ratio, usedMB: this.lastUsedMB, totalMB: this.lastTotalMB };
      }
    }
    // Firefox/Safari/초기화 전: navigator.deviceMemory로 총 RAM 추정
    // 사용량은 측정 불가이므로 고정 비율 0.3을 반환하되 레이블로 표기
    const deviceRAM = (typeof navigator !== 'undefined' && navigator.deviceMemory)
      ? navigator.deviceMemory * 1024  // GB → MB
      : 2048;                           // 알 수 없으면 2GB 가정
    this.lastUsageRatio = 0;
    this.lastUsedMB  = -1;
    this.lastTotalMB = deviceRAM;
    // crossOriginIsolated 여부에 따라 원인 구분
    this.measureMode = (typeof crossOriginIsolated !== 'undefined' && !crossOriginIsolated)
      ? 'no-coi'      // Cross-Origin Isolated 아님 → coi-serviceworker 필요
      : 'estimate';   // API 자체 미지원
    return { ratio: -1, usedMB: -1, totalMB: deviceRAM };
  },

  adjust() {
    const result = this.measure();
    const { ratio } = result;
    const prev = this.flushThreshold;

    if (ratio >= 0) {
      // 실측값으로 조정
      if      (ratio < 0.40) this.flushThreshold = 64 * 1024 * 1024;
      else if (ratio < 0.60) this.flushThreshold = 32 * 1024 * 1024;
      else if (ratio < 0.75) this.flushThreshold = 16 * 1024 * 1024;
      else if (ratio < 0.85) this.flushThreshold =  8 * 1024 * 1024;
      else                   this.flushThreshold =  4 * 1024 * 1024;
    }
    // ratio < 0이면 측정 불가 → 임계값 유지 (기본 32MB)

    if (this.flushThreshold !== prev) {
      self.postMessage({ type: "log", level: "info",
        message: `메모리 ${this.label()} → flush 임계값 ${(this.flushThreshold/1024/1024).toFixed(0)}MB` });
    }
    return result;
  },

  // 사람이 읽기 좋은 메모리 레이블
  label() {
    if (this.measureMode === 'heap') {
      return `${this.lastUsedMB.toFixed(0)}MB / ${this.lastTotalMB.toFixed(0)}MB (${(this.lastUsageRatio*100).toFixed(1)}%)`;
    }
    if (this.measureMode === 'estimate') {
      return `측정 불가 (브라우저 미지원, RAM ${this.lastTotalMB >= 1024 ? (this.lastTotalMB/1024).toFixed(0)+'GB' : this.lastTotalMB+'MB'} 추정)`;
    }
    return '측정 중...';
  },

  reset() { this.accumulatedBytes = 0; },
  shouldFlush() { return this.accumulatedBytes >= this.flushThreshold; },
  add(n) { this.accumulatedBytes += n; },
};

// ══════════════════════════════════════════════
// ── 시트 상태 ──
// ══════════════════════════════════════════════
let _sheetCount   = 0;
let _freezeHeader = false;
let _headerBytes  = null;  // 첫 배치의 첫 행 범위 Uint8Array (freezeHeader용)
let _rowCount     = 0;
let _rowOffset    = 0;     // freezeHeader 시 행 번호 오프셋
let _blobParts    = [];
let _flushedBlobs = [];
let _chain        = Promise.resolve();

function flushParts() {
  if (_blobParts.length === 0) return;
  _flushedBlobs.push(new Blob(_blobParts, { type: 'application/octet-stream' }));
  _blobParts = [];
  MemMgr.reset();
}

// ── WASM 콜백 ──
CsvXlsx({
  locateFile: (path) => 'wasm/' + path,

  // C++이 첫 줄 분석 후 구분자 감지 결과 전달
  onDelimiter: function(delim, colCount, sample) {
    const label =
      delim === ','  ? ', (쉼표)' :
      delim === '|'  ? '| (파이프)' :
      delim === '\t' ? '\t (탭)' : '; (세미콜론)';
    self.postMessage({
      type: 'delimiter',
      delim,
      colCount,
      sample,
      label,
    });
    self.postMessage({ type: 'log', level: 'info',
      message: `구분자 감지: ${label} — ${colCount}열` });
  },

  // freezeHeader 시 2번째 시트부터 행 번호 오프셋 (+1, 헤더가 r=1 차지)
  onStart: function() {
    _sheetCount++;
    const idx = _sheetCount;
    _rowCount      = 0;
    _rowOffset     = 0;   // 행 번호 오프셋
    _blobParts    = [SHEET_HEADER];
    _flushedBlobs = [];
    MemMgr.reset();

    if (_freezeHeader && idx > 1 && _headerBytes !== null) {
      _blobParts.push(_headerBytes);
      MemMgr.add(_headerBytes.byteLength);
      _rowCount  = 1;
      _rowOffset = 1;  // C++ 배치의 r 번호에 +1 오프셋
    }

    _chain = _chain.then(() => {
      self.postMessage({ type: "log", level: "info",
        message: `파일 ${idx} 시작 — 메모리 ${MemMgr.label()}` });
    });
  },

  // C++에서 500행 묶음 XML 문자열을 한 번에 전달
  // onRow 대신 onBatch: enc.encode 호출 1/500로 감소
  onBatch: function(batchXml) {
    // freezeHeader: 첫 번째 배치에서 첫 행의 XML만 추출해 저장 (r="1" 원본)
    if (_freezeHeader && _headerBytes === null && batchXml.length > 0) {
      const end = batchXml.indexOf('</row>');
      if (end !== -1) {
        _headerBytes = enc.encode(batchXml.slice(0, end + 6));
      }
    }

    // freezeHeader + 2번째 시트: r 번호에 오프셋 적용
    // C++은 currentRow=1부터 생성하지만 헤더가 이미 r=1을 차지 → +1
    let xmlToEncode = batchXml;
    if (_rowOffset > 0) {
      // <row r="N"> 와 <c r="XN" 의 숫자 N을 N+offset으로 치환
      // 정규식: row r="숫자" 와 c r="열문자숫자"
      xmlToEncode = batchXml
        .replace(/(<row r=")(\d+)(")/g, (_, a, n, b) => a + (parseInt(n) + _rowOffset) + b)
        .replace(/(<c r="[A-Z]+)(\d+)(")/g, (_, a, n, b) => a + (parseInt(n) + _rowOffset) + b);
    }

    const bytes = enc.encode(xmlToEncode);

    // 행 수 카운트
    let batchRowCnt = 0;
    let pos = 0;
    while ((pos = batchXml.indexOf('</row>', pos)) !== -1) { batchRowCnt++; pos += 6; }
    processedRows += batchRowCnt;
    _rowCount     += batchRowCnt;

    _blobParts.push(bytes);
    MemMgr.add(bytes.byteLength);

    if (MemMgr.shouldFlush()) {
      flushParts();
      MemMgr.adjust();
    }
  },

  onEnd: function() {
    const idx      = _sheetCount;
    // 헤더 행(_rowOffset분)은 제외한 실제 데이터 행 수 보고
    const rowCount = _rowCount - _rowOffset;
    _blobParts.push(SHEET_FOOTER);
    flushParts();

    const blobs = _flushedBlobs;
    _flushedBlobs = [];

    _chain = _chain.then(async () => {
      const t0 = performance.now();
      const sheetBlob = new Blob(blobs, { type: 'application/octet-stream' });

      const bw = new zip.BlobWriter("application/zip");
      const zw = new zip.ZipWriter(bw);
      await zw.add("[Content_Types].xml",        new zip.TextReader(CONTENT_TYPES_XML));
      await zw.add("_rels/.rels",                new zip.TextReader(RELS_XML));
      await zw.add("xl/workbook.xml",            new zip.TextReader(WORKBOOK_XML));
      await zw.add("xl/_rels/workbook.xml.rels", new zip.TextReader(WORKBOOK_RELS_XML));
      await zw.add("xl/styles.xml",              new zip.TextReader(STYLES_XML));
      await zw.add("xl/worksheets/sheet1.xml",   new zip.BlobReader(sheetBlob));
      const zipBlob     = await zw.close();
      const arrayBuffer = await zipBlob.arrayBuffer();
      const elapsed = ((performance.now() - t0) / 1000).toFixed(1);

      const suffix = String(idx).padStart(3, '0');
      const name   = baseFileName + "_" + suffix + ".xlsx";
      MemMgr.measure();

      self.postMessage({ type: "log", level: "success",
        message: `파일 ${idx} 완성: ${name} — ${rowCount.toLocaleString()}행, ` +
          `${(arrayBuffer.byteLength/1024).toFixed(0)}KB (${elapsed}초) | 메모리 ${MemMgr.label()}` });
      self.postMessage(
        { type: "fileReady", fileIndex: idx, name, rowCount, buffer: arrayBuffer },
        [arrayBuffer]
      );
      MemMgr.adjust();
    });
  },

}).then((instance) => {
  wasmModule  = instance;
  moduleReady = true;
  // 진단: crossOriginIsolated 상태 및 performance.memory 가용 여부 로깅
  const coi     = typeof crossOriginIsolated !== 'undefined' ? crossOriginIsolated : '(undefined)';
  const hasMem  = typeof performance !== 'undefined' && !!performance.memory;
  const memInfo = hasMem
    ? `jsHeapSizeLimit=${(performance.memory.jsHeapSizeLimit/1024/1024).toFixed(0)}MB`
    : '(없음)';
  console.log(`[worker] crossOriginIsolated=${coi}, performance.memory=${hasMem}, ${memInfo}`);
  self.postMessage({ type: "log", level: "info",
    message: `진단 — crossOriginIsolated: ${coi} | performance.memory: ${hasMem} | ${memInfo}` });

  MemMgr.adjust();

  self.postMessage({ type: "log", level: "info",
    message: `WASM 초기화 완료 — 메모리 ${MemMgr.label()}` });
  if (pendingStart) { handleStart(pendingStart); pendingStart = null; }
}).catch(err => console.error("[worker] WASM 초기화 실패:", err));

// ── 전체 메모리 해제 ──
function cleanup() {
  // JS 힙: 배열 참조 해제 → GC
  _blobParts    = [];
  _flushedBlobs = [];
  _headerBytes  = null;
  _rowOffset    = 0;
  pendingStart  = null;
  _chain        = Promise.resolve();
  MemMgr.accumulatedBytes = 0;

  // WASM 힙: Emscripten이 관리하는 내부 버퍼 초기화
  // _init(0) 호출로 static 변수 clear (leftover, batchBuf 등)
  if (wasmModule) {
    try { wasmModule._init(0); } catch(_) {}
  }


}

self.onmessage = async (e) => {
  if (e.data.type === "start") {
    if (!moduleReady) pendingStart = e.data;
    else await handleStart(e.data);
  } else if (e.data.type === "cleanup") {
    cleanup();
  } else if (e.data.type === "memFromMain") {
    // 메인 스레드에서 performance.memory 측정값 수신
    MemMgr.updateFromMain(e.data.usedMB, e.data.totalMB);
    MemMgr.adjust(); // flush 임계값 재조정
  }
};

async function handleStart(data) {
  const { file } = data;
  processedRows  = 0;
  _sheetCount    = 0;
  _freezeHeader  = !!data.freezeHeader;
  _headerBytes   = null;
  _rowOffset     = 0;
  _blobParts     = [];
  _flushedBlobs  = [];
  _chain         = Promise.resolve();
  baseFileName   = file.name.replace(/\.[^/.]+$/, "");
  const totalBytes = file.size;

  MemMgr.adjust();
  self.postMessage({ type: "log", level: "info",
    message: `파일 로드: ${file.name} (${(totalBytes/1024/1024).toFixed(1)}MB) | ` +
      `분할: ${data.splitRows.toLocaleString()}행 | 메모리: ${MemMgr.label()}` });

  wasmModule._init(data.splitRows);

  const reader = file.stream().getReader();
  let processedBytes = 0;
  let lastMemCheck   = 0;

  while (true) {
    const { done, value } = await reader.read();
    if (done) break;
    const ptr = wasmModule._malloc(value.length);
    wasmModule.HEAPU8.set(value, ptr);
    wasmModule._process_chunk(ptr, value.length);
    wasmModule._free(ptr);
    processedBytes += value.length;

    if (processedBytes - lastMemCheck > 5 * 1024 * 1024) {
      MemMgr.adjust();
      lastMemCheck = processedBytes;
    }

    // processedBytes는 totalBytes 초과 방지 (파싱 완료 전 정확한 진행률 보장)
    const reportedBytes = Math.min(processedBytes, totalBytes);
    self.postMessage({
      type: "progress", processedRows,
      processedBytes: reportedBytes, totalBytes,
      currentSheet: _sheetCount,
      memUsage: MemMgr.lastUsageRatio,
      memUsedMB: MemMgr.lastUsedMB,
      memTotalMB: MemMgr.lastTotalMB,
      memMode: MemMgr.measureMode,
    });
  }

  wasmModule._finish();

  self.postMessage({ type: "log", level: "info",
    message: `CSV 파싱 완료 — ${processedRows.toLocaleString()}행 | ${_sheetCount}개 파일 조립 중...` });

  // 총 출력 파일 수 확정 → Flutter 조립 단계 진행률 계산용
  self.postMessage({ type: "totalSheets", totalSheets: _sheetCount });

  await _chain;
  self.postMessage({ type: "done", totalFiles: _sheetCount, processedRows });
}