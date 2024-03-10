function modal_help_myland(page){
	const modal_help = document.getElementById('modal_help');
	const modal_helpButton = document.getElementById('modal_helpButton');

	switch (page) {
		case 0:
			if (modal_help) {
				modal_help.remove();
			}
			document.getElementsByTagName('body')[0].insertAdjacentHTML('beforeend', `
				<div id="modal_help" class="relative z-30 select-none" aria-labelledby="modal-title" role="dialog" aria-modal="true">
					<div class="fixed inset-0 bg-gray-500 bg-opacity-75 transition-opacity"></div>
					
						<div class="fixed inset-0 z-10 w-screen overflow-y-auto">
							<div class="flex min-h-full items-end justify-center p-4 text-center lg:items-center lg:p-0">
								<div class="relative transform overflow-hidden rounded-lg bg-white text-left shadow-xl transition-all lg:my-8 lg:w-full lg:max-w-lg lg:w-full lg:max-w-2xl">
								
								<div class="absolute top-0 right-0 pt-4 pr-4">
									<button onclick="modal_close('modal_help', 'remove')" type="button" class="rounded-md text-gray-400 hover:text-gray-500 focus:outline-none focus:ring-2 focus:ring-inset focus:ring-red-500">
										<span class="sr-only">Close</span>
										<svg class="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
											<path stroke-linecap="round" stroke-linejoin="round" d="M6 18L18 6M6 6l12 12" />
										</svg>
									</button>
								</div>
								
								<div class="bg-white px-4 pb-4 pt-5 lg:p-6 lg:pb-4">
									<div class="lg:flex lg:items-start">
										<div class="w-full mt-3 text-center lg:ml-4 lg:mt-0 lg:text-left">
											<h3 class="text-base font-semibold leading-6 text-gray-900" id="modal-title">서비스 설명</h3>
											<div id="model_helpContent_myland" class="mt-2">
												<img class="object-cover w-full pb-2" src="./img/토지이동이력/help_0.png">
												<p class="text-sm text-gray-500">상단의 주소를 입력하여 검색 후 일치하는 주소를 클릭합니다.</p>
											</div>
										</div>
									</div>
								</div>
								<div id="modal_helpButton" class="bg-gray-50 py-3 flex px-6">
									<button onclick="modal_help_myland(1)" type="button" class="m-1 inline-flex w-full justify-center rounded-md bg-blue-600 px-3 py-2 text-sm font-semibold text-white shadow-sm hover:bg-blue-400">다음</button>
								</div>
							</div>
						</div>
					</div>
				</div>
			`);
			break;
		case 1:
			modal_helpButton.innerHTML = `
				<button onclick="modal_help_myland(0)" type="button" class="m-1 inline-flex w-full justify-center rounded-md bg-white px-3 py-2 text-sm font-semibold text-gray-900 shadow-sm ring-1 ring-inset ring-gray-300 hover:bg-gray-50">이전</button>
				<button onclick="modal_close('modal_help', 'remove')" type="button" class="m-1 inline-flex w-full justify-center rounded-md bg-red-600 px-3 py-2 text-sm font-semibold text-white shadow-sm hover:bg-red-400">닫기</button>
				`;

			document.querySelector('#model_helpContent_myland > img').src = './img/토지이동이력/help_1.png';
			document.querySelector('#model_helpContent_myland > p').textContent = '해당 지점을 클릭합니다.';

			break;
	}
}



window.onload = function() {
	const searchInput = document.getElementById('drawer_myland_layerSeacrh');
	const items = document.querySelectorAll('#layers_myland li');

	searchInput.addEventListener('input', () => {
		const searchText = searchInput.value.toLowerCase();

		items.forEach(item => {
			const labelText = item.textContent.toLowerCase();
			if (labelText.includes(searchText)) {
				item.style.display = ''; // 표시
			} else {
				item.style.display = 'none'; // 숨김
			}
		});
	});
}


