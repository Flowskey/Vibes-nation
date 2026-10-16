const SUPABASE_URL = "https://snmvnbpbmagvcreqhyyj.supabase.co";
const SUPABASE_ANON_KEY = "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InNubXZuYnBibWFndmNyZXFoeXlqIiwicm9sZSI6ImFub24iLCJpYXQiOjE3OTIwNjE3NjEsImV4cCI6MjEwNzYzNzc2MX0.qlrg7DZBuySqgQTrpRQJ2cetkNO1eFzM00_vrnPRQlA";

const supabase = window.supabase.createClient(
  SUPABASE_URL,
  SUPABASE_ANON_KEY
);
const $ = s => document.querySelector(s);
const $$ = s => [...document.querySelectorAll(s)];

const seedPosts = [
  {id:1,name:"Zainab A.",handle:"@zainabcreates",initials:"ZA",avatar:"grad1",time:"12 min ago",text:"A little reminder for today: you don’t have to have everything figured out. Keep showing up, keep learning, and let your journey unfold. ✨💜 #VibesOfTheDay",likes:128,comments:18,shares:7,art:"",following:true},
  {id:2,name:"Aminu Musa",handle:"@aminu_music",initials:"AM",avatar:"grad2",time:"38 min ago",text:"Northern sounds, fresh energy. Been working on something special for you all 🎧🔥 Who’s ready?",likes:86,comments:24,shares:11,art:"music",artText:"SOUND OF THE NORTH ✦",following:true},
  {id:3,name:"Maryam Yusuf",handle:"@maryamwrites",initials:"MY",avatar:"grad3",time:"1 hr ago",text:"Campus days are a mix of deadlines, good friends, and tiny wins that deserve to be celebrated. 📚🤍 #StudentLife",likes:64,comments:12,shares:4,art:"campus",artText:"ONE DAY AT A TIME",following:false}
];

let posts = [...seedPosts];
let nextPost = 4;
let activeFilter = "all";
let activeChat = "";
let unread = 4;

let chats = [];

let stories = [
  {name:"Zainab",initials:"ZA",avatar:"grad1",text:"Little moments, big memories ✨"},
  {name:"Aminu",initials:"AM",avatar:"grad2",text:"Studio session 🎧"},
  {name:"Maryam",initials:"MY",avatar:"grad3",text:"A calm evening 🤍"},
  {name:"Faisal",initials:"FA",avatar:"grad4",text:"Good energy only!"},
  {name:"Hauwa",initials:"HA",avatar:"grad5",text:"Grateful for today 🌸"}
];

let notifications = [
  {initials:"ZA",avatar:"grad1",text:"<b>Zainab A.</b> liked your post.",time:"2 minutes ago",unread:true},
  {initials:"AM",avatar:"grad2",text:"<b>Aminu Musa</b> started following you.",time:"18 minutes ago",unread:true},
  {initials:"MY",avatar:"grad3",text:"<b>Maryam Yusuf</b> commented: “This is so true! 🤍”",time:"42 minutes ago",unread:true},
  {initials:"FA",avatar:"grad4",text:"<b>Faisal Bello</b> mentioned you in a post.",time:"1 hour ago",unread:true},
  {initials:"VN",avatar:"me",text:"Welcome to <b>Vibes Nation</b> — your community starts here.",time:"Yesterday",unread:false}
];

function toast(msg) {
  const t = $("#toast");
  if (!t) return;
  t.textContent = msg;
  t.classList.add("show");
  clearTimeout(window.toastTimer);
  window.toastTimer = setTimeout(() => t.classList.remove("show"), 2400);
}

function escapeHTML(s) {
  return String(s).replace(/[&<>"']/g, c => ({
    '&':'&amp;', '<':'&lt;', '>':'&gt;', '"':'&quot;', "'":'&#39;'
  }[c]));
}

function nav(page) {
  $$(".page").forEach(p => p.classList.add("hidden"));
  const target = $("#"+page+"Page");
  if (target) target.classList.remove("hidden");

  $$(".nav-item").forEach(b => b.classList.toggle("active", b.dataset.page === page));

  const title = $("#pageTitle");
  if (title) title.textContent = ({
    feed:"Home Feed",
    messages:"Messages",
    stories:"Stories",
    notifications:"Notifications",
    profile:"My Profile"
  })[page] || "Home Feed";

  if (page === "messages") renderChats();
  if (page === "stories") renderStories();
  if (page === "notifications") renderNotifications();
  if (page === "profile") renderProfile();

  window.scrollTo({top:0,behavior:"smooth"});
}

function postHTML(p) {
  return `<article class="post-card card" data-post="${p.id}">
    <div class="post-head">
      <div class="avatar ${p.avatar}">${escapeHTML(p.initials)}</div>
      <div class="post-user"><b>${escapeHTML(p.name)}</b><small>${escapeHTML(p.handle)} · ${escapeHTML(p.time)}</small></div>
      <button class="more-btn" data-more="${p.id}" aria-label="Post options">•••</button>
    </div>
    <p class="post-copy">${escapeHTML(p.text)}</p>
    ${p.art ? `<div class="post-art ${p.art}">${escapeHTML(p.artText || "")}</div>` : ""}
    <div class="post-meta">
      <span>💜 <span class="like-count">${p.likes}</span> likes</span>
      <span>${p.comments} comments · ${p.shares} shares</span>
    </div>
    <div class="post-actions">
      <button class="action-btn ${p.liked?"liked":""}" data-like="${p.id}">${p.liked?"♥":"♡"} Like</button>
      <button class="action-btn" data-comment="${p.id}">▢ Comment</button>
      <button class="action-btn" data-share="${p.id}">↗ Share</button>
    </div>
  </article>`;
}

function renderPosts() {
  const search = ($("#searchInput")?.value || "").toLowerCase().trim();
  let list = posts.filter(p => activeFilter !== "following" || p.following);

  if (activeFilter === "popular") list = [...list].sort((a,b) => b.likes-a.likes);
  if (search) list = list.filter(p => (p.name+" "+p.text+" "+p.handle).toLowerCase().includes(search));

  const container = $("#posts");
  if (container) {
    container.innerHTML = list.length
      ? list.map(postHTML).join("")
      : '<div class="card post-card muted">No posts found. Try another search.</div>';
  }

  const count = $("#postCount");
  if (count) count.textContent = posts.filter(p => p.name === "Muhammed Hussain").length;
}

function renderProfile() {
  const container = $("#profilePosts");
  if (!container) return;

  container.innerHTML = posts.filter(p => p.name === "Muhammed Hussain").map(postHTML).join("")
    || '<p class="muted">Your posts will appear here when you share something.</p>';

  const count = $("#postCount");
  if (count) count.textContent = posts.filter(p => p.name === "Muhammed Hussain").length;
}

function renderChats() {
  const query = ($("#chatSearch")?.value || "").toLowerCase();
  const list = chats.filter(c => c.name.toLowerCase().includes(query));
  const contacts = $("#chatContacts");

  if (contacts) {
    contacts.innerHTML = list.map(c => `
      <button class="contact ${c.name===activeChat?"active":""}" data-chat="${escapeHTML(c.name)}">
        <div class="avatar ${c.avatar}">${escapeHTML(c.initials)}</div>
        <div class="contact-info"><b>${escapeHTML(c.name)}</b><small>${escapeHTML(c.preview || "")}</small></div>
        <span class="contact-time">${escapeHTML(c.time || "")}</span>
      </button>`).join("") || '<p class="muted">No conversations yet. Use New Chat and enter a username.</p>';
  }

  const c = chats.find(x => x.name === activeChat) || chats[0];
  if (!c) {
    if ($("#activeChatName")) $("#activeChatName").textContent = "Choose a conversation";
    if ($("#activeChatAvatar")) $("#activeChatAvatar").textContent = "VN";
    if ($("#chatMessages")) $("#chatMessages").innerHTML = '<p class="muted">Your private messages will appear here.</p>';
    return;
  }

  activeChat = c.name;
  if ($("#activeChatName")) $("#activeChatName").textContent = c.name;
  if ($("#activeChatAvatar")) {
    $("#activeChatAvatar").textContent = c.initials;
    $("#activeChatAvatar").className = "avatar " + c.avatar;
  }

  if ($("#chatMessages")) {
    $("#chatMessages").innerHTML = (c.messages || []).map(m => `
      <div class="message ${m.mine?"mine":""}">
        ${escapeHTML(m.text)}
        <small>${escapeHTML(m.time || "")}</small>
      </div>`).join("");
    $("#chatMessages").scrollTop = $("#chatMessages").scrollHeight;
  }
}

function renderStories() {
  const container = $("#storyGrid");
  if (!container) return;
  container.innerHTML = stories.map(s => `
    <button class="story-tile" data-story="${escapeHTML(s.name)}">
      <div class="post-head">
        <div class="avatar ${s.avatar}">${escapeHTML(s.initials)}</div>
        <div class="post-user">${escapeHTML(s.name)}<small>Recent story</small></div>
      </div>
      <div class="story-caption">${escapeHTML(s.text)}</div>
      <small>Tap to view story →</small>
    </button>`).join("");
}

function renderNotifications() {
  const container = $("#notificationList");
  if (!container) return;

  container.innerHTML = notifications.map((n,i) => `
    <div class="notification ${n.unread?"unread":""}">
      <div class="avatar ${n.avatar}">${n.initials}</div>
      <div class="notice-text">${n.text}<small>${n.time}</small></div>
      <button class="text-btn" data-notice="${i}">${n.unread?"View":"✓"}</button>
    </div>`).join("");

  const count = notifications.filter(n => n.unread).length;
  $$('[data-page="notifications"] .count').forEach(el => el.textContent = count || "");
}

function openModal(id) {
  const modal = $("#"+id);
  if (!modal) return;
  modal.classList.remove("hidden");
  const field = modal.querySelector("textarea,input");
  if (field) setTimeout(() => field.focus(), 50);
}

function closeModal(el) {
  if (el) el.classList.add("hidden");
}

function addPost(text) {
  posts.unshift({
    id:nextPost++,name:"Muhammed Hussain",handle:"@hussain_vibes",
    initials:"MH",avatar:"me",time:"Just now",text,likes:0,
    comments:0,shares:0,following:true,liked:false
  });
  renderPosts();
  toast("Your post is live on Vibes Nation! ✨");
}

function addStory(text) {
  stories.unshift({name:"You",initials:"MH",avatar:"me",text});
  renderStories();
  toast("Story shared with your community!");
}

document.addEventListener("click", e => {
  const navBtn = e.target.closest("[data-page]");
  if (navBtn) { nav(navBtn.dataset.page); return; }

  const like = e.target.closest("[data-like]");
  if (like) {
    const p = posts.find(p => String(p.id) === like.dataset.like);
    if (p) { p.liked = !p.liked; p.likes += p.liked ? 1 : -1; renderPosts(); }
    return;
  }

  const comment = e.target.closest("[data-comment]");
  if (comment) {
    const p = posts.find(p => String(p.id) === comment.dataset.comment);
    const value = prompt("Write a comment:");
    if (p && value && value.trim()) { p.comments++; toast("Comment added."); renderPosts(); }
    return;
  }

  const share = e.target.closest("[data-share]");
  if (share) {
    const p = posts.find(p => String(p.id) === share.dataset.share);
    if (p) {
      p.shares++;
      if (navigator.share) navigator.share({title:"Vibes Nation",text:p.text}).catch(()=>{});
      else if (navigator.clipboard) navigator.clipboard.writeText(p.text).catch(()=>{});
      toast("Post ready to share!");
      renderPosts();
    }
    return;
  }

  const chat = e.target.closest("[data-chat]");
  if (chat) { activeChat = chat.dataset.chat; renderChats(); return; }

  const story = e.target.closest("[data-story]");
  if (story) {
    const s = stories.find(x => x.name === story.dataset.story);
    if (s) toast(s.name + ": " + s.text);
    return;
  }

  const more = e.target.closest("[data-more]");
  if (more) {
    const choice = prompt("Type 'copy' to copy the post text, or cancel.");
    if (choice && choice.toLowerCase() === "copy") {
      const p = posts.find(p => String(p.id) === more.dataset.more);
      if (p && navigator.clipboard) navigator.clipboard.writeText(p.text).catch(()=>{});
      toast("Post text copied if clipboard permission is available.");
    }
    return;
  }

  const notice = e.target.closest("[data-notice]");
  if (notice) { notifications[+notice.dataset.notice].unread = false; renderNotifications(); return; }

  if (e.target.closest("[data-close]")) {
    closeModal(e.target.closest(".modal-backdrop"));
    return;
  }

  if (e.target.classList.contains("modal-backdrop")) closeModal(e.target);
});

if ($("#openComposer")) $("#openComposer").onclick = () => openModal("postModal");
if ($("#composerPost")) $("#composerPost").onclick = () => openModal("postModal");

if ($("#postForm")) $("#postForm").onsubmit = e => {
  e.preventDefault();
  const t = $("#postText").value.trim();
  if (t) { addPost(t); $("#postText").value = ""; closeModal($("#postModal")); }
};

if ($("#addStory")) $("#addStory").onclick = () => openModal("storyModal");
if ($("#storyCreate")) $("#storyCreate").onclick = () => openModal("storyModal");

if ($("#storyForm")) $("#storyForm").onsubmit = e => {
  e.preventDefault();
  const t = $("#storyText").value.trim();
  if (t) { addStory(t); $("#storyText").value = ""; closeModal($("#storyModal")); }
};

$$(".feed-tab").forEach(b => b.onclick = () => {
  activeFilter = b.dataset.filter;
  $$(".feed-tab").forEach(x => x.classList.toggle("active", x === b));
  renderPosts();
});

if ($("#searchInput")) $("#searchInput").addEventListener("input", renderPosts);
if ($("#chatSearch")) $("#chatSearch").addEventListener("input", renderChats);

if ($("#chatForm")) $("#chatForm").onsubmit = async e => {
  e.preventDefault();
  const input = $("#chatInput");
  const text = input.value.trim();
  if (!text) return;

  const c = chats.find(c => c.name === activeChat);
  if (!c || !c.conversationId) {
    toast("Choose a real private conversation first.");
    return;
  }

  const ok = await window.sendVibesMessage(c.conversationId, text);
  if (ok) input.value = "";
};

if ($("#newChat")) $("#newChat").onclick = async () => {
  const username = prompt("Enter the person's username (not their display name):");
  if (username && username.trim()) await window.startVibesChat(username.trim());
};

if ($("#attachBtn")) $("#attachBtn").onclick = () => toast("Media attachments will be available in a future update.");

if ($("#markRead")) $("#markRead").onclick = () => {
  notifications.forEach(n => n.unread = false);
  renderNotifications();
  toast("All notifications marked as read.");
};

if ($("#editProfile")) $("#editProfile").onclick = () => {
  const name = prompt("Display name:", "Muhammed Hussain");
  if (name && name.trim()) {
    const heading = document.querySelector(".profile-content h2");
    if (heading) heading.innerHTML = escapeHTML(name.trim()) + ' <span class="verified">✓</span>';
    toast("Profile display updated.");
  }
};

$$(".follow-btn").forEach(b => b.onclick = () => {
  const following = b.textContent === "Following";
  b.textContent = following ? "Follow" : "Following";
  b.style.background = following ? "#9d6bff14" : "#62d6a51a";
  b.style.color = following ? "#c6a9ff" : "#62d6a5";
  toast(following ? "Unfollowed" : "You’re now following this creator!");
});

if ($("#composerPost")) $("#composerPost").setAttribute("type","button");

renderPosts();
renderChats();
renderNotifications();

/* SUPABASE CONNECTION */
(function initVibesBackend() {
  const cfg = window.VIBES_CONFIG || {};
  const configured = !!(
    cfg.supabaseUrl &&
    cfg.supabaseAnonKey &&
    cfg.supabaseAnonKey !== "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InNubXZuYnBibWFndmNyZXFoeXlqIiwicm9sZSI6ImFub24iLCJpYXQiOjE3OTIwNjE3NjEsImV4cCI6MjEwNzYzNzc2MX0.qlrg7DZBuySqgQTrpRQJ2cetkNO1eFzM00_vrnPRQlA"
  );

  let sb = null;
  let currentUser = null;
  let authMode = "signin";
  let chatChannel = null;

  const authModal = document.getElementById("authModal");
  const authOpen = document.getElementById("authOpen");
  const authForm = document.getElementById("authForm");
  const authTitle = document.getElementById("authTitle");
  const authHint = document.getElementById("authHint");
  const authSubmit = document.getElementById("authSubmit");
  const authSwitch = document.getElementById("authSwitch");
  const authSwitchText = document.getElementById("authSwitchText");
  const authName = document.getElementById("authName");
  const authNameLabel = document.getElementById("authNameLabel");
  const originalAddPost = addPost;

  function authModeView() {
    if (!authTitle || !authHint || !authSubmit || !authSwitchText || !authSwitch || !authName || !authNameLabel) return;
    const signup = authMode === "signup";
    authTitle.textContent = signup ? "Create your account" : "Welcome back";
    authHint.textContent = signup ? "Join the community and keep your posts synced." : "Sign in to sync your profile and posts.";
    authSubmit.textContent = signup ? "Create account" : "Sign in";
    authSwitchText.textContent = signup ? "Already have an account?" : "New to Vibes Nation?";
    authSwitch.textContent = signup ? "Sign in" : "Create account";
    authName.classList.toggle("hidden", !signup);
    authNameLabel.classList.toggle("hidden", !signup);
    authName.required = signup;
    const password = document.getElementById("authPassword");
    if (password) password.autocomplete = signup ? "new-password" : "current-password";
  }

  function setSignedIn(user) {
    currentUser = user || null;
    if (authOpen) authOpen.textContent = currentUser ? "Sign out" : "Sign in";

    const avatar = document.getElementById("topAvatar");
    if (avatar) {
      const label = currentUser
        ? (currentUser.user_metadata?.display_name || currentUser.email || "VN")
        : "MH";
      avatar.textContent = label.trim().slice(0,2).toUpperCase();
    }

    const status = document.getElementById("backendStatus");
    if (status) status.textContent = currentUser
      ? "Connected · " + currentUser.email
      : (configured ? "Connected to Supabase" : "Demo mode · configure Supabase key");
  }

  async function loadRemotePosts() {
    if (!sb) return;
    const {data,error} = await sb.from("posts")
      .select("id,user_id,content,created_at,likes_count,comments_count,profiles(display_name,username,avatar_url)")
      .order("created_at", {ascending:false})
      .limit(50);

    if (error) {
      console.warn("Could not load Supabase posts:", error.message);
      return;
    }
    if (!data) return;

    const remote = data.map(row => ({
      id:"remote-"+row.id,
      dbId:row.id,
      user_id:row.user_id,
      name:row.profiles?.display_name || "Vibes member",
      handle:"@"+(row.profiles?.username || "member"),
      initials:(row.profiles?.display_name || "VN").split(/\s+/).map(x=>x[0]).join("").slice(0,2).toUpperCase(),
      avatar:"grad2",
      time:new Date(row.created_at).toLocaleString(),
      text:row.content,
      likes:row.likes_count || 0,
      comments:row.comments_count || 0,
      shares:0,
      following:true,
      remote:true
    }));

    const localOwn = posts.filter(p => !p.remote && p.name === "Muhammed Hussain");
    posts = [...localOwn, ...remote];
    renderPosts();
    renderProfile();
  }

  async function ensureProfile(user, displayName) {
    if (!sb || !user) return;
    const name = (displayName || user.user_metadata?.display_name || user.email?.split("@")[0] || "Vibes Member").trim();
    const username = (name.toLowerCase().replace(/[^a-z0-9_]+/g,"_").replace(/^_+|_+$/g,"").slice(0,22) || "member") + "_" + user.id.slice(0,5);

    const {error} = await sb.from("profiles").upsert(
      {id:user.id,display_name:name,username},
      {onConflict:"id",ignoreDuplicates:true}
    );
    if (error) console.warn("Profile setup:", error.message);
  }

  const initialsFor = name => (name || "VN").split(/\s+/).map(x=>x[0] || "").join("").slice(0,2).toUpperCase();

  async function loadRemoteChats() {
    if (!sb || !currentUser) return;

    const {data:members,error:memberError} = await sb.from("conversation_members")
      .select("conversation_id,user_id")
      .eq("user_id", currentUser.id);

    if (memberError) {
      console.warn("Could not load conversation memberships:", memberError.message);
      toast("Messages could not load: " + memberError.message);
      return;
    }

    const ids = [...new Set((members || []).map(m => m.conversation_id))];
    if (!ids.length) {
      chats = [];
      activeChat = "";
      renderChats();
      return;
    }

    const otherIds = [...new Set((members || []).filter(m => m.user_id !== currentUser.id).map(m => m.user_id))];

    const [{data:profiles,error:profileError},{data:messages,error:messageError}] = await Promise.all([
      sb.from("profiles").select("id,username,display_name,avatar_url").in("id", otherIds),
      sb.from("messages").select("id,conversation_id,sender_id,content,created_at,read_at")
        .in("conversation_id", ids).order("created_at", {ascending:true})
    ]);

    if (profileError || messageError) {
      const err = profileError || messageError;
      console.warn("Could not load private messages:", err.message);
      toast("Messages could not load: " + err.message);
      return;
    }

    const profileById = Object.fromEntries((profiles || []).map(p => [p.id,p]));
    const previous = chats.find(c => c.name === activeChat);

    chats = ids.map(id => {
      const member = (members || []).find(m => m.conversation_id === id && m.user_id !== currentUser.id);
      const profile = member && profileById[member.user_id];
      const name = profile?.display_name || profile?.username || "Vibes member";
      const rows = (messages || []).filter(m => m.conversation_id === id);
      const last = rows[rows.length - 1];

      return {
        name,
        username:profile?.username || "",
        userId:member?.user_id,
        conversationId:id,
        initials:initialsFor(name),
        avatar:"grad5",
        time:last ? new Date(last.created_at).toLocaleTimeString([], {hour:"2-digit",minute:"2-digit"}) : "",
        preview:last?.content || "Start a conversation",
        messages:rows.map(m => ({
          text:m.content,
          mine:m.sender_id === currentUser.id,
          time:new Date(m.created_at).toLocaleTimeString([], {hour:"2-digit",minute:"2-digit"})
        }))
      };
    }).sort((a,b) => {
      const ta = a.messages.length ? a.messages.length : 0;
      const tb = b.messages.length ? b.messages.length : 0;
      return tb - ta;
    });

    activeChat = (previous && chats.find(c => c.conversationId === previous.conversationId)?.name) || chats[0]?.name || "";
    renderChats();

    const active = chats.find(c => c.name === activeChat);
    if (active?.conversationId) {
      const {error} = await sb.from("messages").update({read_at:new Date().toISOString()})
        .eq("conversation_id", active.conversationId)
        .neq("sender_id", currentUser.id)
        .is("read_at", null);
      if (error) console.warn("Could not mark messages read:", error.message);
    }
  }

  async function startRemoteChat(username) {
    if (!sb || !currentUser) {
      toast("Sign in before starting a private chat.");
      return;
    }

    const clean = username.replace(/^@/,"").trim();
    const {data:conversationId,error} = await sb.rpc("start_private_conversation", {p_username:clean});

    if (error) {
      toast("Could not open chat: " + error.message);
      return;
    }

    await loadRemoteChats();
    const opened = chats.find(c => c.conversationId === conversationId);
    if (opened) {
      activeChat = opened.name;
      renderChats();
      toast("Private conversation opened.");
    } else {
      toast("Conversation created, but it could not be loaded yet.");
    }
  }

  async function sendRemoteMessage(conversationId, text) {
    if (!sb || !currentUser) {
      toast("Sign in to send private messages.");
      return false;
    }

    const {error} = await sb.from("messages").insert({
      conversation_id:conversationId,
      sender_id:currentUser.id,
      content:text
    });

    if (error) {
      toast("Message could not send: " + error.message);
      return false;
    }

    await loadRemoteChats();
    return true;
  }

  window.loadVibesChats = loadRemoteChats;
  window.startVibesChat = startRemoteChat;
  window.sendVibesMessage = sendRemoteMessage;

  function subscribeToMessages() {
    if (!sb || chatChannel) return;

    chatChannel = sb.channel("vibes-private-messages")
      .on("postgres_changes", {event:"*",schema:"public",table:"messages"}, () => {
        if (currentUser) loadRemoteChats();
      })
      .subscribe();
  }

  if (configured && window.supabase?.createClient) {
    sb = window.supabase.createClient(cfg.supabaseUrl, cfg.supabaseAnonKey);
    window.vibesSupabase = sb;

    sb.auth.getSession().then(async ({data}) => {
      setSignedIn(data.session?.user || null);
      if (data.session?.user) {
        await ensureProfile(data.session.user);
        await loadRemotePosts();
        await loadRemoteChats();
        subscribeToMessages();
      }
    });

    sb.auth.onAuthStateChange((_event, session) => {
      setSignedIn(session?.user || null);

      if (session?.user) {
        setTimeout(async () => {
          await ensureProfile(session.user);
          await loadRemotePosts();
          await loadRemoteChats();
          subscribeToMessages();
        }, 0);
      } else {
        chats = [];
        activeChat = "";
        renderChats();

        if (chatChannel) {
          sb.removeChannel(chatChannel);
          chatChannel = null;
        }
      }
    });
  }

  const status = document.createElement("div");
  status.id = "backendStatus";
  status.className = "sync-status";
  status.textContent = configured ? "Connecting to Supabase…" : "Demo mode · configure Supabase key";

  const banner = document.querySelector(".welcome-banner > div");
  if (banner) banner.appendChild(status);

  if (!configured) console.info("Vibes Nation is in demo mode. Add your Supabase anon key in config.js to enable account/database sync.");

  if (authOpen) authOpen.addEventListener("click", async () => {
    if (currentUser && sb) {
      const {error} = await sb.auth.signOut();
      if (error) toast(error.message);
      else {
        setSignedIn(null);
        toast("You have signed out.");
      }
      return;
    }

    if (!configured) {
      toast("Add your Supabase public anon key in config.js first.");
      openModal("authModal");
      return;
    }

    authMode = "signin";
    authModeView();
    openModal("authModal");
  });

  if (authSwitch) authSwitch.addEventListener("click", () => {
    authMode = authMode === "signin" ? "signup" : "signin";
    authModeView();
  });

  if (authForm) authForm.addEventListener("submit", async e => {
    e.preventDefault();
    if (!sb) {
      toast("Supabase is not configured yet.");
      return;
    }

    const email = document.getElementById("authEmail").value.trim();
    const password = document.getElementById("authPassword").value;
    const name = authName?.value.trim() || "";
    if (authSubmit) authSubmit.disabled = true;

    try {
      if (authMode === "signup") {
        const {data,error} = await sb.auth.signUp({
          email,
          password,
          options:{data:{display_name:name || email.split("@")[0]}}
        });

        if (error) throw error;

        if (data.user && !data.session) {
          toast("Account created. Check your email to confirm, then sign in.");
          closeModal(authModal);
        } else if (data.user) {
          await ensureProfile(data.user, name);
          setSignedIn(data.user);
          closeModal(authModal);
          toast("Welcome to Vibes Nation!");
          await loadRemotePosts();
          await loadRemoteChats();
          subscribeToMessages();
        }
      } else {
        const {data,error} = await sb.auth.signInWithPassword({email,password});
        if (error) throw error;

        setSignedIn(data.user);
        await ensureProfile(data.user);
        closeModal(authModal);
        toast("You are signed in!");
        await loadRemotePosts();
        await loadRemoteChats();
        subscribeToMessages();
      }
    } catch (err) {
      toast(err.message || "Could not authenticate. Check your details and Supabase settings.");
    } finally {
      if (authSubmit) authSubmit.disabled = false;
    }
  });

  addPost = async function(text) {
    if (sb && currentUser) {
      const {data,error} = await sb.from("posts")
        .insert({user_id:currentUser.id,content:text})
        .select("id,user_id,content,created_at,likes_count,comments_count")
        .single();

      if (error) {
        toast("Post could not sync: " + error.message);
        return;
      }

      posts.unshift({
        id:"remote-"+data.id,
        dbId:data.id,
        user_id:data.user_id,
        name:currentUser.user_metadata?.display_name || currentUser.email.split("@")[0],
        handle:"@"+(currentUser.user_metadata?.display_name || "member").toLowerCase().replace(/[^a-z0-9]+/g,"_"),
        initials:"ME",
        avatar:"me",
        time:"Just now",
        text:data.content,
        likes:0,
        comments:0,
        shares:0,
        following:true,
        remote:true
      });

      renderPosts();
      renderProfile();
      toast("Your post is live and synced! ✨");
      return;
    }

    originalAddPost(text);
  };

  window.refreshVibesPosts = loadRemotePosts;
  authModeView();
})();
