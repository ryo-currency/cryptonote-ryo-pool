if(document.cookie.indexOf("dark-theme=false")!==-1){
    document.getElementById("dark-theme").checked = false;
    document.body.classList.remove("dark-theme");
}
function change_dt(t){
    var domainName = window.location.hostname;
    document.cookie="dark-theme="+t.checked+";path=/;domain=."+domainName;
    if(t.checked)
        document.body.classList.add("dark-theme");
    else
        document.body.classList.remove("dark-theme");
}