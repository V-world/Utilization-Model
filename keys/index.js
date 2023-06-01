let link
function deatil(model){
    document.querySelector("#info").style.display = "block";
    document.querySelector("#use").style.display = "none";
    link = model.dataset.link;
    let modelName = model.querySelector("span").innerText;
    document.querySelector("#modelName").innerText = "□ "+modelName;
    document.querySelector("#modelLink").onclick = function () {
        window.open(link, "_blank");
    }
    document.querySelector("#imgTitle").onclick = function () {
        window.open(link, "_blank");
    }
    document.querySelector("#imgs img").src = "./keys/imgs/" + link.split("/")[2] + ".png";
    document.querySelector("#subtitle").innerText = model.querySelector("vp").innerText;
    document.querySelector("#help").innerText = model.querySelector("vt").innerText;
    document.querySelector("#githubDownload").onclick = function () {
        window.open("https://github.com/V-world/Utilization-Model/tree/main" + link.replace(".", "").replace("/index.html", ""), "_blank");
    }
}


//imgs img 클릭시 콘솔 로그 출력
document.querySelector("#imgs img").onclick = function () {
    window.open(link);
}