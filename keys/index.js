let link
function deatil(model){
    document.querySelector("#info").style.display = "block";
    document.querySelector("#use").style.display = "none";
    link = model.dataset.link;
    let modelName = model.querySelector("span").innerText;
    document.querySelector("#modelName").innerText = "□ "+modelName;
    document.querySelector("#modelLink").onclick = function () {
        window.open(link);
    }
    document.querySelector("#imgs img").src = "./keys/imgs/" + link.split("/")[2] + ".png";
}


//imgs img 클릭시 콘솔 로그 출력
document.querySelector("#imgs img").onclick = function () {
    window.open(link);
}