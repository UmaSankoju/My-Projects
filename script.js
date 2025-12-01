/* ==========================================================
      ECO TRACK — MULTI-USER LOCAL STORAGE SYSTEM
   Each user has their own activities, points & rewards
========================================================== */

// =======================
// CHECK LOGGED-IN USER
// =======================
const loggedInUser = localStorage.getItem("loggedInUser");

// If user is not logged in → send to login page
if (!loggedInUser) {
    window.location.href = "login.html";
}



// =======================
// USER-BASED STORAGE KEYS
// =======================
const ACT_KEY = "activities_" + loggedInUser;
const POINT_KEY = "totalPoints_" + loggedInUser;
const MILE_KEY = "rewardMilestones_" + loggedInUser;
const REWARD_KEY = "earnedRewards_" + loggedInUser;


// =======================
// INITIAL STORAGE SETUP
// =======================
if (!localStorage.getItem(ACT_KEY)) localStorage.setItem(ACT_KEY, JSON.stringify([]));
if (!localStorage.getItem(POINT_KEY)) localStorage.setItem(POINT_KEY, "0");
if (!localStorage.getItem(MILE_KEY)) localStorage.setItem(MILE_KEY, JSON.stringify([]));
if (!localStorage.getItem(REWARD_KEY)) localStorage.setItem(REWARD_KEY, JSON.stringify([]));



// ======================================================
// AUTO POINT CALCULATION BASED ON ACTIVITY
// ======================================================
function determinePoints(title, category, hasImage) {
    const t = (title || "").toLowerCase();
    const c = (category || "").toLowerCase();
    const bonus = hasImage ? 5 : 0;

    if (t.includes("plant") || t.includes("tree"))
        return Math.floor(50 + Math.random() * 21) + bonus;

    if (t.includes("recycle") || c.includes("recycle"))
        return Math.floor(10 + Math.random() * 15) + bonus;

    if (t.includes("plastic") || t.includes("avoid"))
        return Math.floor(5 + Math.random() * 11) + bonus;

    if (t.includes("walk") || t.includes("cycle"))
        return Math.floor(10 + Math.random() * 21) + bonus;

    if (t.includes("clean"))
        return Math.floor(20 + Math.random() * 21) + bonus;

    return Math.floor(5 + Math.random() * 46) + bonus;
}



// ======================================================
// TOAST NOTIFICATION
// ======================================================
function showToast(msg, duration = 2000) {
    let toast = document.getElementById("ecotoast");
    if (!toast) {
        toast = document.createElement("div");
        toast.id = "ecotoast";
        toast.style.cssText = `
        position: fixed; left: 50%; transform: translateX(-50%);
        bottom: 40px; padding: 12px 22px; background: rgba(0,0,0,0.85);
        color: white; border-radius: 20px; font-size: 16px; opacity: 0;
        transition: 0.3s; z-index: 9999;
        `;
        document.body.appendChild(toast);
    }

    toast.innerText = msg;
    toast.style.opacity = "1";
    toast.style.bottom = "60px";

    setTimeout(() => {
        toast.style.opacity = "0";
        toast.style.bottom = "40px";
    }, duration);
}



// ======================================================
// FORM SUBMISSION — ADD ACTIVITY
// ======================================================
document.addEventListener("DOMContentLoaded", () => {

    const form = document.querySelector(".form-box");

    form.addEventListener("submit", function (e) {
        e.preventDefault();

        const inputs = form.querySelectorAll("input");
        const title = inputs[0].value.trim();
        const category = inputs[1].value.trim();
        const fileInput = document.getElementById("ecoImage");
        const date = inputs[3].value;

        if (!title) return showToast("Please enter activity title!");
        if (!date) return showToast("Please select a date!");

        const hasImage = fileInput.files.length > 0;
        const points = determinePoints(title, category, hasImage);

        const newAct = { title, category, points, date, hasImage };

        let all = JSON.parse(localStorage.getItem(ACT_KEY));
        all.push(newAct);
        localStorage.setItem(ACT_KEY, JSON.stringify(all));

        let total = parseInt(localStorage.getItem(POINT_KEY));
        total += points;
        localStorage.setItem(POINT_KEY, total);

        showToast(`You gained ${points} points!`);

        checkForMilestone(total);
        updateDashboard();

        form.reset();
    });

    updateDashboard();
});



// ======================================================
// NEXT POINT TARGET
// ======================================================
function getNextTarget(total) {
    return Math.ceil(total / 100) * 100 || 100;
}



// ======================================================
// CHECK MILESTONE ACHIEVEMENT
// ======================================================
function checkForMilestone(totalPoints) {

    const milestone = Math.floor(totalPoints / 100) * 100;
    if (milestone < 100) return;

    let achieved = JSON.parse(localStorage.getItem(MILE_KEY));

    if (achieved.includes(milestone)) return;

    achieved.push(milestone);
    localStorage.setItem(MILE_KEY, JSON.stringify(achieved));

    let reward = "Eco Hero";
    if (milestone === 100) reward = "Green Starter";
    else if (milestone === 500) reward = "Eco Warrior";
    else if (milestone === 1000) reward = "Planet Protector";

    let earned = JSON.parse(localStorage.getItem(REWARD_KEY));
    if (!earned.includes(reward)) {
        earned.push(reward);
        localStorage.setItem(REWARD_KEY, JSON.stringify(earned));
    }

    showRewardPopup(milestone, reward);
    startConfettiFor10Seconds();
}



// ======================================================
// UPDATE DASHBOARD UI
// ======================================================
function updateDashboard() {

    const total = parseInt(localStorage.getItem(POINT_KEY));

    const curr = document.getElementById("currentScore");
    if (curr) curr.innerText = total + " pts";

    const target = document.getElementById("targetScore");
    if (target) target.innerText = getNextTarget(total) + " pts";

    loadRecentActivities();
    displayRewards();
}



// ======================================================
// SHOW RECENT ACTIVITIES (USER-BASED)
// ======================================================
function loadRecentActivities() {
    const list = document.querySelector(".activity-list");
    const acts = JSON.parse(localStorage.getItem(ACT_KEY));

    list.innerHTML = "";

    acts.slice(-5).reverse().forEach(a => {
        list.innerHTML += `
            <li><strong>${a.title}</strong> — ${a.points} pts (${a.date}) ${a.hasImage ? "📷" : ""}</li>
        `;
    });
}



// ======================================================
// POPUP REWARD
// ======================================================
function showRewardPopup(points, rewardName) {

    const popup = document.getElementById("rewardPopup");
    const msg = document.getElementById("rewardMessage");
    const text = document.getElementById("rewardText");

    msg.innerHTML = `🎉 Congratulations!`;
    text.innerHTML = `
        You reached <strong>${points} points!</strong><br>
        Reward Unlocked: <strong>${rewardName}</strong> 🌟<br><br>
        Keep doing eco-friendly activities!`;

    popup.style.display = "flex";
}

function closeRewardPopup() {
    document.getElementById("rewardPopup").style.display = "none";
}



// ======================================================
// REWARD SECTION — USER-BASED
// ======================================================
function displayRewards() {
    const box = document.getElementById("rewardBox");
    const earned = JSON.parse(localStorage.getItem(REWARD_KEY));

    if (!earned || earned.length === 0) {
        box.innerHTML = `
            <p>No rewards yet. Keep earning points! 🌱</p>
        `;
        return;
    }

    let html = "";

    earned.forEach(reward => {
        if (reward === "Green Starter") {
            html += `
                <div class="reward-earned">
                    <strong>🎉 Green Starter</strong>
                    <p>You unlocked this reward after reaching 100 points! 🌱</p>
                </div><br>`;
        }

        if (reward === "Eco Warrior") {
            html += `
                <div class="reward-earned">
                    <strong>🔥 Eco Warrior</strong>
                    <p>You became an Eco Warrior by scoring 500 points! 💪</p>
                </div><br>`;
        }

        if (reward === "Planet Protector") {
            html += `
                <div class="reward-earned">
                    <strong>🌎 Planet Protector</strong>
                    <p>You reached 1000 points and became a protector of our planet! 🌍</p>
                </div><br>`;
        }

        if (reward === "Eco Hero") {
            html += `
                <div class="reward-earned">
                    <strong>🌟 Eco Hero</strong>
                    <p>You crossed another 100-point milestone! Keep going! 💚</p>
                </div><br>`;
        }
    });

    box.innerHTML = html;
}



// ======================================================
// CONFETTI ANIMATION
// ======================================================
let confettiAnimationId = null;

function startConfettiFor10Seconds() {
    const canvas = document.getElementById("confettiCanvas");
    const ctx = canvas.getContext("2d");

    canvas.width = window.innerWidth;
    canvas.height = window.innerHeight;

    const pieces = [];
    for (let i = 0; i < 200; i++) {
        pieces.push({
            x: Math.random() * canvas.width,
            y: Math.random() * -canvas.height,
            size: 6 + Math.random() * 6,
            color: ["#ff4d4d","#ffcc00","#33cc33","#3399ff","#ff66cc"][Math.floor(Math.random()*5)],
            speed: 2 + Math.random() * 4
        });
    }

    function animate() {
        ctx.clearRect(0, 0, canvas.width, canvas.height);

        pieces.forEach(p => {
            p.y += p.speed;
            if (p.y > canvas.height) p.y = -10;
            ctx.fillStyle = p.color;
            ctx.fillRect(p.x, p.y, p.size, p.size);
        });

        confettiAnimationId = requestAnimationFrame(animate);
    }

    animate();

    setTimeout(() => {
        cancelAnimationFrame(confettiAnimationId);
        ctx.clearRect(0, 0, canvas.width, canvas.height);
    }, 10000);
}
