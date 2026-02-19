// ================= PASSWORD SYSTEM ===================
function simpleHash(str){
    let hash=0;
    for(let i=0;i<str.length;i++){
        hash=(hash<<5)-hash+str.charCodeAt(i);
        hash|=0;
    }
    return hash.toString();
}

function setupPassword(){
    if(!localStorage.getItem("spc_password")){
        localStorage.setItem("spc_password", simpleHash("spc123"));
    }
}

function login(){
    const input = document.getElementById("passwordInput").value;
    const hashedInput = simpleHash(input);
    const storedHash = localStorage.getItem("spc_password");

    if(hashedInput === storedHash){
        localStorage.setItem("spc_logged_in", "true");
        showApp();
    } else {
        alert("Incorrect Password ❌");
    }
}

function changePassword(){
    const oldPass = document.getElementById("oldPassword").value;
    const newPass = document.getElementById("newPassword").value;
    const confirmPass = document.getElementById("confirmPassword").value;

    const savedHash = localStorage.getItem("spc_password");

    if(simpleHash(oldPass) !== savedHash){
        alert("Current password is wrong ❌");
        return;
    }

    if(newPass !== confirmPass){
        alert("New passwords do not match ❌");
        return;
    }

    localStorage.setItem("spc_password", simpleHash(newPass));
    alert("Password Changed Successfully ✅");
    closeChangePassword();
}

function logout(){
    localStorage.removeItem("spc_logged_in");
    location.reload();
}

// ================= SHOW APP ===================
function showApp(){
    document.getElementById("loginScreen").style.display="none";
    document.getElementById("appContent").style.display="block";
    loadAppData(); // load tables after login
}

// ================= NAVIGATION ===================
function showScreen(id){
    document.querySelectorAll('.screen').forEach(s=>s.classList.remove('active'));
    document.getElementById(id).classList.add('active');
}

// ================= HARVEST & SALES ===================
function addHarvestRow(date = "", trays = "", damaged = ""){
    const tbody = document.querySelector("#harvestTable tbody");
    const row = tbody.insertRow();

    row.innerHTML = `
        <td><input type="date" value="${date}"></td>
        <td><input type="number" min="0" value="${trays}"></td>
        <td><input type="number" min="0" value="${damaged}"></td>
        <td><button onclick="deleteRow(this)">X</button></td>
    `;

    row.querySelectorAll("input").forEach(input => input.addEventListener("change", calculateTotals));
}

function addSalesRow(date = "", trays = "", consumer = ""){
    const tbody = document.querySelector("#salesTable tbody");
    const row = tbody.insertRow();

    row.innerHTML = `
        <td><input type="date" value="${date}"></td>
        <td><input type="number" min="0" value="${trays}"></td>
        <td><input type="text" value="${consumer}"></td>
        <td><button onclick="deleteRow(this)">X</button></td>
    `;

    row.querySelectorAll("input").forEach(input => input.addEventListener("change", calculateTotals));
}

function deleteRow(btn){
    btn.parentElement.parentElement.remove();
    calculateTotals();
}

// ================= CALCULATE DASHBOARD ===================
function calculateTotals(){
    let harvestRows=document.querySelectorAll("#harvestTable tbody tr");
    let salesRows=document.querySelectorAll("#salesTable tbody tr");

    let totalHarvest=0,totalDamaged=0,totalSold=0;

    harvestRows.forEach(r=>{
        let trays=parseInt(r.cells[1].children[0].value)||0;
        let damaged=parseInt(r.cells[2].children[0].value)||0;
        totalHarvest+=trays;
        totalDamaged+=damaged;
    });

    salesRows.forEach(r=>{
        let trays=parseInt(r.cells[1].children[0].value)||0;
        totalSold+=trays;
    });

    let available=totalHarvest-totalSold;
    if(available<0){available=0;}

    document.getElementById("availableTrays").innerText=available;
    document.getElementById("damagedTotal").innerText=totalDamaged;
    document.getElementById("harvestTotal").innerText=totalHarvest;
    document.getElementById("soldTotal").innerText=totalSold;
}

// ================= SAVE & LOAD DATA ===================
function saveAppData(){
    const appData = { harvest: [], sales: [] };

    document.querySelectorAll("#harvestTable tbody tr").forEach(r=>{
        appData.harvest.push({
            date: r.cells[0].children[0].value || "",
            trays: Number(r.cells[1].children[0].value) || 0,
            damaged: Number(r.cells[2].children[0].value) || 0
        });
    });

    document.querySelectorAll("#salesTable tbody tr").forEach(r=>{
        appData.sales.push({
            date: r.cells[0].children[0].value || "",
            trays: Number(r.cells[1].children[0].value) || 0,
            consumer: r.cells[2].children[0].value || ""
        });
    });

    localStorage.setItem("eggAppData", JSON.stringify(appData));
    alert("✅ Data Saved Successfully!");
}

function loadAppData(){
    const saved = localStorage.getItem("eggAppData");
    if(!saved) return;

    const appData = JSON.parse(saved);

    // HARVEST
    const harvestBody = document.querySelector("#harvestTable tbody");
    harvestBody.innerHTML = "";
    appData.harvest.forEach(item => addHarvestRow(item.date, item.trays, item.damaged));

    // SALES
    const salesBody = document.querySelector("#salesTable tbody");
    salesBody.innerHTML = "";
    appData.sales.forEach(item => addSalesRow(item.date, item.trays, item.consumer));

    calculateTotals();
}

// ================= INIT ON LOAD ===================
window.addEventListener("DOMContentLoaded", ()=>{
    setupPassword();

    if(localStorage.getItem("spc_logged_in") === "true"){
        showApp();
    } else {
        document.getElementById("loginScreen").style.display="block";
        document.getElementById("appContent").style.display="none";
    }

    // Hook up save button if exists
    const saveBtn = document.getElementById("saveBtn");
    if(saveBtn){
        saveBtn.addEventListener("click", saveAppData);
    }
});
