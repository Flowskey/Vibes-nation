const SUPABASE_URL = "https://snmvnbpbmagvcreqxyyj.supabase.co";
const SUPABASE_ANON_KEY = "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InNubXZuYnBibWFndmNyZXFoeXlqIiwicm9sZSI6ImFub24iLCJpYXQiOjE3OTIwNjE3NjEsImV4cCI6MjEwNzYzNzc2MX0.qlrg7DZBuySqgQTrpRQJ2cetkNO1eFzM00_vrnPRQlA";
const supabaseClient = supabase.createClient(SUPABASE_URL, SUPABASE_ANON_KEY);
const supabase = supabaseClient;

const $=s=>document.querySelector(s), $$=s=>[...document.querySelectorAll(s)];
const seedPosts=[
{id:1,name:"Zainab A.",handle:"@zainabcreates",initials:"ZA",avatar:"grad1",time:"12 min ago",text:"A little reminder for today: you don’t have to have everything figured out. Keep showing up, keep learning, and let your journey unfold. ✨💜 #VibesOfTheDay",likes:128,comments:18,shares:7,art:"",following:true},
{id:2,name:"Aminu Musa",handle:"@aminu_music",initials:"AM",avatar:"grad2",time:"38 min ago",text:"Northern sounds, fresh energy. Been working on something special for you all 🎧🔥 Who’s ready?",likes:86,comments:24,shares:11,art:"music",artText:"SOUND OF THE NORTH ✦",following:true},
{id:3,name:"Maryam Yusuf",handle:"@maryamwrites",initials:"MY",avatar:"grad3",time:"1 hr ago",text:"Campus days are a mix of deadlines, good friends, and tiny wins that deserve to be celebrated. To everyone studying tonight — you’ve got this! 📚🤍 #StudentLife",likes:64,comments:12,shares:4,art:"campus",artText:"ONE DAY AT A TIME",following:false}
];
let posts=[...seedPosts], nextPost=4, activeFilter="all", activeChat="Zainab A.", unread=4;
let chats=[
{name:"Zainab A.",initials:"ZA",avatar:"grad1",time:"2m",preview:"That sounds great! 💜",messages:[{text:"Hey Hussain! How’s your day going?",mine:false,time:"8:42 PM"},{text:"Pretty good, thanks! Just checking out Vibes Nation.",mine:true,time:"8:43 PM"},{text:"That sounds great! 💜",mine:false,time:"8:44 PM"}]},
{name:"Aminu Musa",initials:"AM",avatar:"grad2",time:"15m",preview:"Send me the track when ready",messages:[{text:"I’m working on a new track this week.",mine:false,time:"8:12 PM"},{text:"Nice! Send me the track when ready 🎧",mine:true,time:"8:14 PM"}]},
{name:"Maryam Yusuf",initials:"MY",avatar:"grad3",time:"1h",preview:"Thank you for the support!",messages:[{text:"Loved your latest post.",mine:true,time:"7:15 PM"},{text:"Thank you for the support! 🤍",mine:false,time:"7:18 PM"}]},
{name:"Faisal Bello",initials:"FA",avatar:"grad4",time:"Yesterday",preview:"See you on campus",messages:[{text:"See you on campus tomorrow.",mine:false,time:"Yesterday"}]}
];
let stories=[{name:"Zainab",initials:"ZA",avatar:"grad1",text:"Little moments, big memories ✨"},{name:"Aminu",initials:"AM",avatar:"grad2",text:"Studio session 🎧"},{name:"Maryam",initials:"MY",avatar:"grad3",text:"A calm evening 🤍"},{name:"Faisal",initials:"FA",avatar:"grad4",text:"Good energy only!"},{name:"Hauwa",initials:"HA",avatar:"grad5",text:"Grateful for today 🌸"}];
let notifications=[
{initials:"ZA",avatar:"grad1",text:"<b>Zainab A.</b> liked your post.",time:"2 minutes ago",unread:true},
{initials:"AM",avatar:"grad2",text:"<b>Aminu Musa</b> started following you.",time:"18 minutes ago",unread:true},
{initials:"MY",avatar:"grad3",text:"<b>Maryam Yusuf</b> commented: “This is so true! 🤍”",time:"42 minutes ago",unread:true},
{initials:"FA",avatar:"grad4",text:"<b>Faisal Bello</b> mentioned you in a post.",time:"1 hour ago",unread:true},
{initials:"VN",avatar:"me",text:"Welcome to <b>Vibes Nation</b> — your community starts here.",time:"Yesterday",unread:false}
];
function toast(msg){const t=$("#toast");t.textContent=msg;t.classList.add("show");clearTimeout(window.toastTimer);window.toastTimer=setTimeout(()=>t.classList.remove("show"),2400)}
function nav(page){$$(".page").forEach(p=>p.classList.add("hidden"));$("#"+page+"Page").classList.remove("hidden");$$(".nav-item").forEach(b=>b.classList.toggle("active",b.dataset.page===page));$("#pageTitle").textContent=({feed:"Home Feed",messages:"Messages",stories:"Stories",notifications:"Notifications",profile:"My Profile"})[page]||"Home Feed";if(page==="messages")renderChats();if(page==="stories")renderStories();if(page==="notifications")renderNotifications();if(page==="profile")renderProfile();window.scrollTo({top:0,behavior:"smooth"})}
function postHTML(p){return `<article class="post-card card" data-post="${p.id}"><div class="post-head"><div class="avatar ${p.avatar}">${p.initials}</div><div class="post-user"><b>${p.name}</b><small>${p.handle} · ${p.time}</small></div><button class="more-btn" data-more="${p.id}" aria-label="Post options">•••</button></div><p class="post-copy">${escapeHTML(p.text)}</p>${p.art?`<div class="post-art ${p.art}">${p.artText}</div>`:""}<div class="post-meta"><span>💜 <span class="like-count">${p.likes}</span> likes</span><span>${p.comments} comments · ${p.shares} shares</span></div><div class="post-actions"><button class="action-btn ${p.liked?"liked":""}" data-like="${p.id}">${p.liked?"♥":"♡"} Like</button><button class="action-btn" data-comment="${p.id}">▢ Comment</button><button class="action-btn" data-share="${p.id}">↗ Share</button></div></article>`}
function escapeHTML(s){return String(s).replace(/[&<>"']/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c]))}
function renderPosts(){let list=posts.filter(p=>activeFilter!=="following"||p.following);if(activeFilter==="popular")list=[...list].sort((a,b)=>b.likes-a.likes);const q=$("#searchInput").value.toLowerCase().trim();if(q)list=list.filter(p=>(p.name+" "+p.text+" "+p.handle).toLowerCase().includes(q));$("#posts").innerHTML=list.length?list.map(postHTML).join(""):'<div class="card post-card muted">No posts found. Try another search.</div>';$("#postCount").textContent=posts.filter(p=>p.name==="Muhammed Hussain").length+3}
function renderProfile(){$("#profilePosts").innerHTML=posts.filter(p=>p.name==="Muhammed Hussain").map(postHTML).join("")||'<p class="muted">Your posts will appear here when you share something.</p>';$("#postCount").textContent=posts.filter(p=>p.name==="Muhammed Hussain").length}
function renderChats(){const q=($("#chatSearch")?.value||"").toLowerCase();$("#chatContacts").innerHTML=chats.filter(c=>c.name.toLowerCase().includes(q)).map(c=>`<button class="contact ${c.name===activeChat?"active":""}" data-chat="${c.name}"><div class="avatar ${c.avatar}">${c.initials}</div><div class="contact-info"><b
