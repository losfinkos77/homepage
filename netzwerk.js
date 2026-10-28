/* =====================================================
   Los Finkos – Netzwerklabor (netzwerk.js)
   Alle Simulationen sind Demo-Daten und laufen lokal.
   ===================================================== */
(function () {
  "use strict";

  /* ---------- Hilfsfunktionen ---------- */
  function $(id) { return document.getElementById(id); }
  function esc(text) {
    const div = document.createElement("div");
    div.textContent = String(text);
    return div.innerHTML;
  }
  function fmt(n, digits) {
    return n.toLocaleString("de-DE", { maximumFractionDigits: digits == null ? 3 : digits });
  }
  function setupCanvas(id) {
    const canvas = $(id);
    const ctx = canvas.getContext("2d");
    function fit() {
      const rect = canvas.getBoundingClientRect();
      const dpr = Math.min(window.devicePixelRatio || 1, 2);
      canvas.width = Math.max(50, Math.floor(rect.width * dpr));
      canvas.height = Math.max(50, Math.floor(rect.height * dpr));
      ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
      return { w: rect.width, h: rect.height };
    }
    return { canvas: canvas, ctx: ctx, fit: fit };
  }

  /* =====================================================
     MODUL 1 – GRUNDWISSEN
     ===================================================== */
  function card(icon, title, unit, text) {
    return '<div class="concept-card"><i class="fas ' + icon + '"></i><h3>' + title + "</h3>" +
      '<span class="unit">' + unit + "</span><p>" + text + "</p></div>";
  }

  function initGrundlagen() {
    $("net-types").innerHTML =
      card("fa-building", "LAN", "Local Area Network", "Lokales Netz zu Hause oder im Büro: Geräte sind über Switch/WLAN mit dem Router verbunden. Reichweite: ein Gebäude.") +
      card("fa-wifi", "WLAN", "IEEE 802.11", "Das LAN ohne Kabel: Geräte funken mit dem Access Point. Praktisch, aber langsamer und störanfälliger als Ethernet.") +
      card("fa-city", "WAN", "Wide Area Network", "Netze über größere Distanzen – mehrere LANs verbunden, z. B. Firmenzentralen über Standort-Links.") +
      card("fa-earth-americas", "Internet", "Netz der Netze", "Weltweit verbundene Netzwerke über Router und Glasfaser. Dein Router übersetzt zwischen Heim-LAN und Internet (NAT).");

    $("ipmac-table").innerHTML =
      "<thead><tr><th></th><th>MAC-Adresse</th><th>IP-Adresse</th></tr></thead><tbody>" +
      "<tr><td class='hl'>Was</td><td>Hardware-Adresse des Netzwerk-Chips</td><td>Logische Adresse im Netz</td></tr>" +
      "<tr><td class='hl'>Beispiel</td><td><code>A8:16:B2:3C:41:07</code></td><td><code>192.168.0.4</code></td></tr>" +
      "<tr><td class='hl'>Ebene</td><td>Schicht 2 (Sicherung, lokal)</td><td>Schicht 3 (Vermittlung, routingfähig)</td></tr>" +
      "<tr><td class='hl'>Änderbar?</td><td>Werksseitig fest (Karte eingebaut)</td><td>Ja – via DHCP oder manuell</td></tr>" +
      "<tr><td class='hl'>Reicht über LAN hinaus?</td><td>Nein – nur im lokalen Netz sichtbar</td><td>Ja – Grundlage des Internets</td></tr>" +
      "</tbody>";

    $("net-devices").innerHTML =
      card("fa-shuffle", "Router", "Schicht 3", "Verbindet verschiedene Netzwerke (LAN ↔ Internet), vergleicht per DHCP Adressen, macht NAT und Firewall. Hat für jedes Netz ein eigenes Interface.") +
      card("fa-ethernet", "Switch", "Schicht 2", "Verbindet viele Geräte im LAN per Kabel und leitet Frames anhand der MAC-Adresse gezielt an den richtigen Port.") +
      card("fa-wifi", "Access Point", "Schicht 2", "Brücke zwischen WLAN und Kabel-LAN: WLAN-Geräte funken zum AP, der sie ins kabelgebundene Netz bringt.") +
      card("fa-tower-broadcast", "Repeater", "Schicht 2", "Verstärkt/reicht das WLAN-Signal weiter – verlängert die Reichweite, halbiert aber oft den Durchsatz (gleiche Funkkarte hört und sendet).");

    $("net-pairs").innerHTML =
      card("fa-user", "Client", "fragt an", "Dein Handy, Laptop, Pi – sie fordern Dienste an (Webseite, Datei, Video) und heißen deshalb auch „Clients“.") +
      card("fa-server", "Server", "antwortet", "Liefert Dienste: Webserver (HTTP), Dateiserver (SMB/NFS), DNS-Server, Game-Server. Läuft auf PCs, Pis oder in der Cloud.") +
      card("fa-handshake", "TCP", "zuverlässig, geordnet", "Verbindungsaufbau (3-Way-Handshake), Wiederholung verlorener Pakete, Reihenfolge garantiert. Für Web, SSH, Downloads.") +
      card("fa-bolt", "UDP", "schnell, ohne Garantie", "Kein Handshake, keine Wiederholung – verlorene Pakete sind weg. Für Videos, Games, DNS, Streaming.") +
      card("fa-address-book", "DNS", "Namen → IPs", "Das „Telefonbuch“: löst google.com zu 142.250.x.x auf. Ohne DNS müsstest du alle Adressen auswendig lernen.") +
      card("fa-id-card", "DHCP", "vergibt IPs", "Dynamic Host Configuration Protocol: neues Gerät fragt per Broadcast „Wer vergibt Adressen?“ und bekommt IP, Gateway, DNS zugewiesen.");

    $("ip46-table").innerHTML =
      "<thead><tr><th></th><th>IPv4</th><th>IPv6</th></tr></thead><tbody>" +
      "<tr><td class='hl'>Länge</td><td>32 Bit → 4,3 Mrd. Adressen</td><td>128 Bit → praktisch unbegrenzt</td></tr>" +
      "<tr><td class='hl'>Schreibweise</td><td><code>192.168.0.4</code> (4 Blöcke, dezimal)</td><td><code>2001:0db8::0001</code> (8 Blöcke, hex, kürzbar)</td></tr>" +
      "<tr><td class='hl'>Konfiguration</td><td>DHCP oder manuell</td><td>SLAAC (automatisch) oder DHCPv6</td></tr>" +
      "<tr><td class='hl'>Broadcast</td><td>Ja (z. B. 192.168.0.255)</td><td>Nein – stattdessen Multicast</td></tr>" +
      "<tr><td class='hl'>NAT nötig?</td><td>Ja (Adressknappheit)</td><td>Nein – jedes Gerät kann global eindeutig sein</td></tr>" +
      "<tr><td class='hl'>Beispiel privat</td><td>192.168.0.0/24</td><td>fd00::/8 (Unique Local)</td></tr>" +
      "</tbody>";

    const OSI = [
      ["7 · Anwendung", "HTTP, DNS, SSH", "Anwendung"],
      ["6 · Darstellung", "TLS-Verschlüsselung, Kodierung", "Anwendung"],
      ["5 · Sitzung", "Sitzungen starten/verwalten", "Anwendung"],
      ["4 · Transport", "TCP, UDP, Ports", "Transport"],
      ["3 · Vermittlung", "IP-Adressen, Router", "Internet"],
      ["2 · Sicherung", "MAC, Switches, Ethernet-Frames", "Netzzugang"],
      ["1 · Bitübertragung", "Kabel, WLAN, Spannungen", "Netzzugang"]
    ];
    const TCPI = [
      ["Anwendung", "HTTP, DNS, SSH, TLS"],
      ["Transport", "TCP, UDP"],
      ["Internet", "IP, ICMP, Router"],
      ["Netzzugang", "Ethernet, WLAN, MAC"]
    ];

    const osiList = $("osi-list"), tcpiList = $("tcpi-list");
    OSI.forEach(function (row) {
      const li = document.createElement("li");
      li.innerHTML = "<span>" + row[0] + "</span><small>" + row[1] + "</small>";
      li.dataset.model = "osi"; li.dataset.group = row[2];
      li.addEventListener("click", function () { highlightLayers("osi", row[2]); });
      osiList.appendChild(li);
    });
    TCPI.forEach(function (row) {
      const li = document.createElement("li");
      li.innerHTML = "<span>" + row[0] + "</span><small>" + row[1] + "</small>";
      li.dataset.model = "tcpi"; li.dataset.group = row[0];
      li.addEventListener("click", function () { highlightLayers("tcpi", row[0]); });
      tcpiList.appendChild(li);
    });

    function highlightLayers(sourceModel, group) {
      Array.prototype.forEach.call(document.querySelectorAll(".layer-list li"), function (li) {
        const match = li.dataset.group === group;
        li.classList.toggle("active", match);
        // Klick im anderen Modell markiert die Entsprechung auf derselben Seite
        if (li.dataset.model !== sourceModel) li.classList.add("active");
        else if (!match) li.classList.remove("active");
      });
    }
  }

  /* =====================================================
     MODUL 2 – NETZWERK-SIMULATOR
     ===================================================== */
  const SIM_TYPES = {
    router: { label: "Router", color: "#ff9d5c", glyph: "R" },
    switch: { label: "Switch", color: "#00bfff", glyph: "SW" },
    pc: { label: "Computer", color: "#3aff8c", glyph: "PC" },
    server: { label: "Server", color: "#c9a0ff", glyph: "SRV" },
    pi: { label: "Raspberry Pi", color: "#ff7b6b", glyph: "PI" },
    ap: { label: "Access Point", color: "#ffd43b", glyph: "AP" },
    wlan: { label: "WLAN-Gerät", color: "#7fd4ff", glyph: "WL" }
  };

  const sim = { devices: [], links: [], nextId: 1, mode: "move", selected: null, pending: null, animating: false };

  function simInit() {
    const addBox = $("sim-add-buttons");
    Object.keys(SIM_TYPES).forEach(function (type) {
      const btn = document.createElement("button");
      btn.type = "button";
      btn.className = "mini-btn";
      btn.innerHTML = '<i class="fas fa-plus"></i> ' + SIM_TYPES[type].label;
      btn.addEventListener("click", function () { simAddDevice(type); });
      addBox.appendChild(btn);
    });
    $("sim-mode").addEventListener("change", function () {
      sim.mode = $("sim-mode").value;
      sim.pending = null;
      const hints = {
        move: "Modus „Verschieben“: Geräte ziehen · Klick = Auswahl (Inspector rechts)",
        connect: "Modus „Verbinden“: erst Gerät A, dann Gerät B anklicken. WLAN-Geräte verbinden sich nur per Funk mit einem Access Point.",
        ping: "Modus „Ping“: erst Quelle, dann Ziel anklicken – die Erreichbarkeit wird anhand von Subnetzen und Router geprüft.",
        delete: "Modus „Löschen“: Gerät anklicken, um es samt Verbindungen zu entfernen."
      };
      $("sim-hint").textContent = hints[sim.mode] || "";
    });
    $("sim-example").addEventListener("click", simLoadExample);
    $("sim-clear").addEventListener("click", function () {
      sim.devices = []; sim.links = []; sim.selected = null; sim.pending = null;
      simRender(); simLog("Netzwerk geleert.", "warn"); simInspector();
    });

    const cv = $("sim-canvas");
    cv.addEventListener("pointerdown", simPointer);
    cv.addEventListener("pointermove", simDrag);
    window.addEventListener("pointerup", function () { sim.drag = null; });
    window.addEventListener("resize", function () { simRender(); });

    simLoadExample();
  }

  function simAutoIp() {
    const used = {};
    sim.devices.forEach(function (d) {
      if (d.ip) used[d.ip] = true;
      if (d.ip2) used[d.ip2] = true;
    });
    for (let i = 2; i <= 254; i++) {
      const ip = "192.168.0." + i;
      if (!used[ip]) return ip;
    }
    return "";
  }

  function simAddDevice(type, x, y) {
    const defaults = {
      router: "192.168.0.1", switch: "", ap: "192.168.0.2",
      pc: simAutoIp(), server: simAutoIp(), pi: simAutoIp(), wlan: simAutoIp()
    };
    sim.devices.push({
      id: sim.nextId++, type: type,
      x: x != null ? x : 60 + Math.random() * 400,
      y: y != null ? y : 60 + Math.random() * 320,
      ip: defaults[type], mask: 24, ip2: ""
    });
    simRender();
    simLog(SIM_TYPES[type].label + " hinzugefügt" + (defaults[type] ? " (IP " + defaults[type] + ")" : " (keine IP nötig – Layer 2)"), "ok");
    simInspector();
  }

  function simLoadExample() {
    sim.devices = []; sim.links = []; sim.nextId = 1;
    const add = function (type, ip, x, y, ip2) {
      const d = { id: sim.nextId++, type: type, x: x, y: y, ip: ip, mask: 24, ip2: ip2 || "" };
      sim.devices.push(d); return d;
    };
    const router = add("router", "192.168.0.1", 300, 40, "192.168.1.1");
    const sw = add("switch", "", 300, 140);
    const pc1 = add("pc", "192.168.0.20", 120, 230);
    const pi = add("pi", "192.168.0.4", 300, 260);
    const ap = add("ap", "192.168.0.2", 490, 140);
    const wl = add("wlan", "192.168.0.50", 490, 260);
    const srv = add("server", "192.168.1.10", 520, 40);
    sim.links = [
      { a: router.id, b: sw.id, wireless: false },
      { a: router.id, b: srv.id, wireless: false },
      { a: sw.id, b: pc1.id, wireless: false },
      { a: sw.id, b: pi.id, wireless: false },
      { a: sw.id, b: ap.id, wireless: false },
      { a: ap.id, b: wl.id, wireless: true }
    ];
    sim.selected = null; sim.pending = null;
    simRender(); simInspector();
    simLog("Beispiel-Topologie geladen: Router (2 Subnetze), Switch, PC, Pi, AP, WLAN-Gerät, Server.", "ok");
    simLog("Teste: Ping vom PC (192.168.0.20) zum Server (192.168.1.10) → geht über den Router!", "");
  }

  function simDeviceById(id) {
    for (let i = 0; i < sim.devices.length; i++) if (sim.devices[i].id === id) return sim.devices[i];
    return null;
  }

  function simHit(x, y) {
    for (let i = sim.devices.length - 1; i >= 0; i--) {
      const d = sim.devices[i];
      if (x >= d.x - 42 && x <= d.x + 42 && y >= d.y - 26 && y <= d.y + 40) return d;
    }
    return null;
  }

  function simPointer(e) {
    const rect = $("sim-canvas").getBoundingClientRect();
    const x = e.clientX - rect.left, y = e.clientY - rect.top;
    const hit = simHit(x, y);

    if (sim.mode === "move") {
      if (hit) {
        sim.selected = hit.id;
        sim.drag = { id: hit.id, dx: x - hit.x, dy: y - hit.y };
        simInspector();
      } else {
        sim.selected = null; simInspector();
      }
      simRender();
    } else if (sim.mode === "connect") {
      if (!hit) return;
      if (!sim.pending) {
        sim.pending = hit.id;
        simLog("Verbinde: erstes Gerät ausgewählt (" + SIM_TYPES[hit.type].label + ") – jetzt das zweite anklicken.", "");
        simRender();
      } else if (sim.pending === hit.id) {
        sim.pending = null; simRender();
      } else {
        const a = simDeviceById(sim.pending), b = hit;
        sim.pending = null;
        simCreateLink(a, b);
      }
    } else if (sim.mode === "ping") {
      if (!hit) return;
      if (!sim.pending) {
        sim.pending = hit.id;
        simLog("Ping-Quelle: " + (hit.ip || SIM_TYPES[hit.type].label) + " – jetzt das Ziel anklicken.", "");
      } else if (sim.pending === hit.id) {
        sim.pending = null;
      } else {
        const src = simDeviceById(sim.pending), dst = hit;
        sim.pending = null;
        simPing(src, dst);
      }
      simRender();
    } else if (sim.mode === "delete") {
      if (hit) simDeleteDevice(hit.id);
    }
  }

  function simDrag(e) {
    if (!sim.drag || sim.mode !== "move") return;
    const rect = $("sim-canvas").getBoundingClientRect();
    const d = simDeviceById(sim.drag.id);
    if (!d) return;
    d.x = Math.max(40, Math.min(rect.width - 40, e.clientX - rect.left - sim.drag.dx));
    d.y = Math.max(24, Math.min(rect.height - 60, e.clientY - rect.top - sim.drag.dy));
    simRender();
  }

  function simDeleteDevice(id) {
    const d = simDeviceById(id);
    if (!d) return;
    sim.devices = sim.devices.filter(function (x) { return x.id !== id; });
    sim.links = sim.links.filter(function (l) { return l.a !== id && l.b !== id; });
    sim.selected = null; sim.pending = null;
    simRender(); simInspector();
    simLog(SIM_TYPES[d.type].label + " entfernt.", "warn");
  }

  function simCreateLink(a, b) {
    if (sim.links.some(function (l) { return (l.a === a.id && l.b === b.id) || (l.a === b.id && l.b === a.id); })) {
      simLog("Diese Verbindung existiert bereits.", "warn"); return;
    }
    const wirelessPair = (a.type === "wlan" && b.type === "ap") || (b.type === "wlan" && a.type === "ap");
    if (a.type === "wlan" || b.type === "wlan") {
      if (!wirelessPair) {
        simLog("Fehler: Ein WLAN-Gerät verbindet sich nur per Funk mit einem Access Point.", "err");
        return;
      }
      sim.links.push({ a: a.id, b: b.id, wireless: true });
      simLog("WLAN-Verbindung: " + SIM_TYPES[a.type].label + " ↔ " + SIM_TYPES[b.type].label + " (Funk, gestrichelt)", "ok");
    } else {
      sim.links.push({ a: a.id, b: b.id, wireless: false });
      simLog("Kabel: " + SIM_TYPES[a.type].label + " ↔ " + SIM_TYPES[b.type].label, "ok");
    }
    simRender();
  }

  /* ---------- Subnetz-/Routing-Logik ---------- */
  function ipToInt(str) {
    const p = String(str || "").trim().split(".");
    if (p.length !== 4) return NaN;
    let n = 0;
    for (let i = 0; i < 4; i++) {
      if (!/^\d{1,3}$/.test(p[i])) return NaN;
      const v = parseInt(p[i], 10);
      if (v < 0 || v > 255) return NaN;
      n = n * 256 + v;
    }
    return n >>> 0;
  }

  function intToIp(n) {
    return [(n >>> 24) & 255, (n >>> 16) & 255, (n >>> 8) & 255, n & 255].join(".");
  }

  function maskFromPrefix(p) {
    return p === 0 ? 0 : ((0xFFFFFFFF << (32 - p)) >>> 0);
  }

  function sameSubnet(ipA, ipB, prefix) {
    const m = maskFromPrefix(prefix);
    return ((ipToInt(ipA) & m) >>> 0) === ((ipToInt(ipB) & m) >>> 0);
  }

  function l2Path(fromId, toId) {
    // BFS über alle Verbindungen (Layer 2 – Switches/Kabel/WLAN sind transparent)
    if (fromId === toId) return [fromId];
    const prev = {}; prev[fromId] = null;
    const queue = [fromId];
    while (queue.length) {
      const cur = queue.shift();
      sim.links.forEach(function (l) {
        let other = null;
        if (l.a === cur) other = l.b;
        else if (l.b === cur) other = l.a;
        if (other != null && !(other in prev)) {
          prev[other] = cur;
          queue.push(other);
        }
      });
    }
    if (!(toId in prev)) return null;
    const path = [];
    let cur = toId;
    while (cur != null) { path.unshift(cur); cur = prev[cur]; }
    return path;
  }

  function deviceInterfaces(d) {
    const list = [];
    if (d.ip) list.push(d.ip);
    if (d.type === "router" && d.ip2) list.push(d.ip2);
    return list;
  }

  function findDuplicateIps() {
    const seen = {};
    const dupes = [];
    sim.devices.forEach(function (d) {
      deviceInterfaces(d).forEach(function (ip) {
        if (seen[ip]) dupes.push(ip);
        seen[ip] = true;
      });
    });
    return dupes;
  }

  function canPing(src, dst) {
    if (!src.ip || isNaN(ipToInt(src.ip))) return { ok: false, reason: SIM_TYPES[src.type].label + " (Quelle) hat keine gültige IP-Adresse – im Inspector setzen." };
    if (!dst.ip || isNaN(ipToInt(dst.ip))) return { ok: false, reason: SIM_TYPES[dst.type].label + " (Ziel) hat keine gültige IP-Adresse – im Inspector setzen." };

    const dupes = findDuplicateIps();
    if (dupes.length) return { ok: false, reason: "IP-Konflikt: Die Adresse " + dupes[0] + " wird mehrfach verwendet. Doppelte IPs zuerst beheben." };

    const sameNet = sameSubnet(src.ip, dst.ip, src.mask);
    if (sameNet) {
      const path = l2Path(src.id, dst.id);
      if (!path) return { ok: false, reason: "Beide im selben Subnetz, aber es fehlt eine physische Verbindung (Kabel/WLAN-Link ziehen)." };
      return { ok: true, path: path, hops: 1 };
    }

    // Unterschiedliche Subnetze → Router mit Interface in beiden Netzen suchen
    let router = null;
    sim.devices.forEach(function (d) {
      if (d.type !== "router") return;
      const ifs = deviceInterfaces(d);
      const inSrc = ifs.some(function (ip) { return sameSubnet(ip, src.ip, src.mask); });
      const inDst = ifs.some(function (ip) { return sameSubnet(ip, dst.ip, dst.mask); });
      if (inSrc && inDst && l2Path(src.id, d.id) && l2Path(d.id, dst.id)) router = d;
    });

    if (!router) {
      const anyRouterInSrc = sim.devices.some(function (d) {
        if (d.type !== "router") return false;
        return deviceInterfaces(d).some(function (ip) { return sameSubnet(ip, src.ip, src.mask); }) && l2Path(src.id, d.id);
      });
      if (!anyRouterInSrc) return { ok: false, reason: "Kein Router im Quellsubnetz erreichbar – verschiedene Subnetze brauchen einen Router, der beide Netze kennt." };
      return { ok: false, reason: "Der Router hat kein Interface im Ziel-Subnetz (" + intToIp((ipToInt(dst.ip) & maskFromPrefix(dst.mask)) >>> 0) + "/" + dst.mask + ") – Routing-Regel fehlt (Simulation)." };
    }

    const p1 = l2Path(src.id, router.id);
    const p2 = l2Path(router.id, dst.id);
    const path = p1.concat(p2.slice(1));
    return { ok: true, path: path, hops: 2 };
  }

  function simPing(src, dst) {
    const check = canPing(src, dst);
    simLog("> ping " + (dst.ip || "?") + " von " + (src.ip || "?"), "");
    if (!check.ok) {
      simLog("Ping fehlgeschlagen: " + check.reason, "err");
      return;
    }
    if (sim.animating) { simLog("Bitte warten – Animation läuft bereits.", "warn"); return; }

    const points = check.path.map(function (id) {
      const d = simDeviceById(id);
      return { x: d.x, y: d.y };
    });
    sim.animating = true;
    animatePath(points, 0, function () {
      const ms = (check.hops === 2 ? 1.2 : 0.4) + Math.random() * 1.4;
      simLog("Antwort von " + dst.ip + ": icmp_seq=1 ttl=" + (check.hops === 2 ? 63 : 64) + " time=" + fmt(ms, 1) + " ms (simuliert)", "ok");
      // Echo Reply zurück
      const rev = points.slice().reverse();
      animatePath(rev, 0, function () {
        sim.animating = false;
        simLog("Ping erfolgreich über " + check.hops + (check.hops === 1 ? " Segment" : " Router-Hop(s)"), "ok");
      });
    });
  }

  function animatePath(points, idx, done) {
    if (idx >= points.length - 1) { if (done) done(); return; }
    const a = points[idx], b = points[idx + 1];
    const t0 = performance.now();
    const dur = 420 + Math.hypot(b.x - a.x, b.y - a.y) * 0.9;

    function frame(now) {
      const t = Math.min(1, (now - t0) / dur);
      simRender();
      const ctx = $("sim-canvas").getContext("2d");
      const rect = $("sim-canvas").getBoundingClientRect();
      const x = a.x + (b.x - a.x) * t, y = a.y + (b.y - a.y) * t;
      ctx.beginPath();
      ctx.fillStyle = "#3aff8c";
      ctx.shadowColor = "rgba(58,255,140,0.9)";
      ctx.shadowBlur = 14;
      ctx.arc(x, y, 6, 0, Math.PI * 2);
      ctx.fill();
      ctx.shadowBlur = 0;
      if (t < 1) window.requestAnimationFrame(frame);
      else animatePath(points, idx + 1, done);
    }
    window.requestAnimationFrame(frame);
  }

  function simRender() {
    const cv = $("sim-canvas");
    if (!cv) return;
    const ctx = cv.getContext("2d");
    const rect = cv.getBoundingClientRect();
    const dpr = Math.min(window.devicePixelRatio || 1, 2);
    if (cv.width !== Math.floor(rect.width * dpr)) {
      cv.width = Math.floor(rect.width * dpr);
      cv.height = Math.floor(rect.height * dpr);
    }
    ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
    const w = rect.width, h = rect.height;

    ctx.fillStyle = "#0a0f14";
    ctx.fillRect(0, 0, w, h);
    ctx.strokeStyle = "rgba(0,191,255,0.06)";
    for (let gx = 0; gx < w; gx += 40) { ctx.beginPath(); ctx.moveTo(gx, 0); ctx.lineTo(gx, h); ctx.stroke(); }
    for (let gy = 0; gy < h; gy += 40) { ctx.beginPath(); ctx.moveTo(0, gy); ctx.lineTo(w, gy); ctx.stroke(); }

    // Verbindungen
    sim.links.forEach(function (l) {
      const a = simDeviceById(l.a), b = simDeviceById(l.b);
      if (!a || !b) return;
      ctx.beginPath();
      ctx.moveTo(a.x, a.y);
      ctx.lineTo(b.x, b.y);
      if (l.wireless) { ctx.setLineDash([7, 6]); ctx.strokeStyle = "rgba(142,36,170,0.85)"; }
      else { ctx.setLineDash([]); ctx.strokeStyle = "rgba(0,191,255,0.65)"; }
      ctx.lineWidth = 2.4;
      ctx.stroke();
      ctx.setLineDash([]);
    });

    // Geräte
    sim.devices.forEach(function (d) {
      const t = SIM_TYPES[d.type];
      const sel = sim.selected === d.id || sim.pending === d.id;
      ctx.beginPath();
      ctx.fillStyle = "#101a22";
      ctx.strokeStyle = sel ? "#3aff8c" : t.color;
      ctx.lineWidth = sel ? 3 : 2;
      const bw = 66, bh = 44;
      roundRect(ctx, d.x - bw / 2, d.y - bh / 2, bw, bh, 10);
      ctx.fill(); ctx.stroke();

      ctx.fillStyle = t.color;
      ctx.font = "700 15px Consolas, monospace";
      ctx.textAlign = "center";
      ctx.fillText(t.glyph, d.x, d.y + 1);

      ctx.font = "11px Consolas, monospace";
      ctx.fillStyle = d.ip ? "#00bfff" : "#6b7785";
      const ipText = d.ip ? d.ip + (d.type === "router" && d.ip2 ? " | " + d.ip2 : "") : "L2";
      ctx.fillText(ipText, d.x, d.y + bh / 2 + 13);
      ctx.fillStyle = "rgba(229,244,255,0.75)";
      ctx.font = "10.5px 'Segoe UI', sans-serif";
      ctx.fillText(t.label, d.x, d.y - bh / 2 - 7);
    });
    ctx.textAlign = "left";

    function roundRect(ctx, x, y, w2, h2, r) {
      ctx.beginPath();
      ctx.moveTo(x + r, y);
      ctx.arcTo(x + w2, y, x + w2, y + h2, r);
      ctx.arcTo(x + w2, y + h2, x, y + h2, r);
      ctx.arcTo(x, y + h2, x, y, r);
      ctx.arcTo(x, y, x + w2, y, r);
      ctx.closePath();
    }
  }

  function simLog(text, cls) {
    const log = $("sim-log");
    const line = document.createElement("div");
    if (cls) line.className = cls;
    line.textContent = "• " + text;
    log.appendChild(line);
    log.scrollTop = log.scrollHeight;
  }

  function simInspector() {
    const box = $("sim-inspector");
    const d = simDeviceById(sim.selected);
    if (!d) {
      box.innerHTML = '<h4><i class="fas fa-screwdriver-wrench"></i> Gerät auswählen …</h4>' +
        '<p style="color:#6b7785; font-size:13px;">Klicke im Canvas auf ein Gerät (im Verschieben-Modus), um IP und Maske zu bearbeiten.</p>';
      return;
    }
    const t = SIM_TYPES[d.type];
    const maskOptions = [24, 25, 26, 27, 28, 30].map(function (p) {
      return '<option value="' + p + '"' + (p === d.mask ? " selected" : "") + ">/" + p + " (" + intToIp(maskFromPrefix(p)) + ")</option>";
    }).join("");

    box.innerHTML =
      '<h4><i class="fas fa-screwdriver-wrench" style="color:' + t.color + ';"></i> ' + esc(t.label) + " #" + d.id + "</h4>" +
      (d.type === "switch"
        ? '<p style="color:#6b7785; font-size:13px; margin:0 0 6px;">Ein Switch arbeitet auf Layer 2 und braucht für das Weiterleiten keine IP-Adresse.</p>'
        : "") +
      (d.type === "router"
        ? '<div class="field"><label>Interface 1 (LAN, ' + intToIp((ipToInt(d.ip || "192.168.0.1") & maskFromPrefix(d.mask)) >>> 0) + "/" + d.mask + ")</label>" +
          '<input type="text" id="insp-ip" value="' + esc(d.ip || "") + '" maxlength="15"></div>' +
          '<div class="field"><label>Interface 2 (z. B. Internet/Gastnetz)</label>' +
          '<input type="text" id="insp-ip2" value="' + esc(d.ip2 || "") + '" maxlength="15" placeholder="z. B. 192.168.1.1"></div>'
        : '<div class="field"><label>IP-Adresse</label>' +
          '<input type="text" id="insp-ip" value="' + esc(d.ip || "") + '" maxlength="15" placeholder="z. B. 192.168.0.' + (10 + (d.id % 90)) + '"></div>') +
      (d.type === "switch" ? "" : '<div class="field"><label>Subnetzmaske</label><select id="insp-mask">' + maskOptions + "</select></div>") +
      '<button class="mini-btn primary" id="insp-save" type="button" style="margin-top:4px;"><i class="fas fa-check"></i> Übernehmen</button>' +
      (d.ip ? '<p class="hint" style="margin-top:8px;">Netzadresse: <code>' + intToIp((ipToInt(d.ip) & maskFromPrefix(d.mask)) >>> 0) + "/" + d.mask + "</code></p>" : "");

    $("insp-save").addEventListener("click", function () {
      const ipField = $("insp-ip");
      const newIp = ipField ? ipField.value.trim() : d.ip;
      const newIp2 = $("insp-ip2") ? $("insp-ip2").value.trim() : d.ip2;
      const newMask = $("insp-mask") ? parseInt($("insp-mask").value, 10) : d.mask;

      const dupe = findDuplicateIps();
      if (dupe.length) { simLog("IP-Konflikt: " + dupe[0] + " ist bereits in Verwendung!", "err"); return; }

      if (d.type !== "switch") {
        if (isNaN(ipToInt(newIp))) { ipField.classList.add("invalid"); simLog("Ungültige IPv4-Adresse: " + newIp, "err"); return; }
        d.ip = newIp; d.mask = newMask;
      }
      if (d.type === "router") {
        if (newIp2 === "") d.ip2 = "";
        else if (isNaN(ipToInt(newIp2))) { simLog("Ungültige IPv4-Adresse bei Interface 2: " + newIp2, "err"); return; }
        else d.ip2 = newIp2;
      }
      simRender(); simInspector();
      simLog("Konfiguration übernommen: " + t.label + " → " + (d.ip || "L2") + (d.ip2 ? " + " + d.ip2 : "") + (d.type !== "switch" ? " /" + d.mask : ""), "ok");
    });
    const ipField = $("insp-ip");
    if (ipField) ipField.addEventListener("input", function () { ipField.classList.remove("invalid"); });
  }

  /* =====================================================
     MODUL 3 – SUBNETZRECHNER
     ===================================================== */
  function subnetCalc(ipStr, prefix) {
    const ip = ipToInt(ipStr);
    if (isNaN(ip)) return { error: "Ungültige IPv4-Adresse (Format: a.b.c.d mit Werten 0–255)." };
    if (!(prefix >= 0 && prefix <= 32)) return { error: "CIDR-Präfix muss zwischen 0 und 32 liegen." };
    const mask = maskFromPrefix(prefix);
    const network = (ip & mask) >>> 0;
    const broadcast = (network | (~mask >>> 0)) >>> 0;
    let first, last, hosts, hostNote;
    if (prefix <= 30) {
      first = network + 1;
      last = broadcast - 1;
      hosts = Math.pow(2, 32 - prefix) - 2;
    } else if (prefix === 31) {
      first = network; last = broadcast; hosts = 2;
      hostNote = "/31: Punkt-zu-Punkt-Verbindung (RFC 3021) – beide Adressen nutzbar.";
    } else {
      first = ip; last = ip; hosts = 1;
      hostNote = "/32: Einzelhost-Route – Netz-, Host- und Broadcastadresse fallen zusammen.";
    }
    return {
      ip: ip, prefix: prefix, mask: mask, wildcard: (~mask) >>> 0,
      network: network, broadcast: broadcast,
      first: first, last: last, hosts: hosts, hostNote: hostNote || ""
    };
  }

  function prefixFromMaskStr(maskStr) {
    const m = ipToInt(maskStr);
    if (isNaN(m)) return { error: "Ungültige Subnetzmaske (Format: a.b.c.d)." };
    let prefix = 0, seenZero = false;
    for (let bit = 31; bit >= 0; bit--) {
      const one = (m >>> bit) & 1;
      if (one) { if (seenZero) return { error: "Keine gültige Subnetzmaske – die 1-Bits müssen von links zusammenhängend sein." }; prefix++; }
      else seenZero = true;
    }
    return { prefix: prefix };
  }

  function initSubnet() {
    const ipEl = $("sn-ip"), prefixEl = $("sn-prefix"), maskEl = $("sn-mask");
    function update() {
      const warn = $("sn-warn");
      warn.style.display = "none";
      let prefix = parseInt(prefixEl.value, 10);
      const maskStr = maskEl.value.trim();

      if (maskStr !== "") {
        const res = prefixFromMaskStr(maskStr);
        if (res.error) return subnetFail(res.error);
        prefix = res.prefix;
        prefixEl.value = String(prefix);
      }

      if (!/^\d{1,3}(\.\d{1,3}){3}$/.test(ipEl.value.trim())) {
        return subnetFail("IPv4-Adresse im Format a.b.c.d eingeben (jeder Block 0–255).");
      }
      const result = subnetCalc(ipEl.value.trim(), prefix);
      if (result.error) return subnetFail(result.error);

      $("sn-network").textContent = intToIp(result.network) + "/" + prefix;
      const rows = [
        ["Subnetzmaske", intToIp(result.mask)],
        ["Wildcard-Maske", intToIp(result.wildcard)],
        ["Broadcastadresse", intToIp(result.broadcast)],
        ["Erste nutzbare Hostadresse", intToIp(result.first)],
        ["Letzte nutzbare Hostadresse", intToIp(result.last)],
        ["Nutzbare Hostadressen", result.hosts.toLocaleString("de-DE") + (result.hostNote ? " – " + result.hostNote : "")]
      ];
      $("sn-results").innerHTML = rows.map(function (r) {
        return '<div class="sn-row"><span class="k">' + r[0] + '</span><span class="v">' + r[1] + "</span></div>";
      }).join("");

      // Binärische Ansicht
      const netBits = result.prefix, bin = [];
      const ipBin = ipToInt(ipEl.value.trim()).toString(2).padStart(32, "0");
      const maskBin = result.mask.toString(2).padStart(32, "0");
      const netBin = result.network.toString(2).padStart(32, "0");
      bin.push('<div class="b-row"><span class="b-label">IP</span>' + colorBits(ipBin, netBits) + "</div>");
      bin.push('<div class="b-row"><span class="b-label">Maske</span>' + colorBits(maskBin, netBits) + "</div>");
      bin.push('<div class="b-row"><span class="b-label">Netzadresse</span>' + colorBits(netBin, netBits) + "</div>");
      bin.push('<div class="b-row" style="margin-top:6px;">' + (result.hostNote ? '<span class="host">' + esc(result.hostNote) + "</span>" : '<span class="host">Blau = Netzanteil (' + netBits + " Bits) · Grau = Hostanteil (" + (32 - netBits) + " Bits)</span>") + "</div>");
      $("sn-binary").innerHTML = bin.join("");
    }

    function colorBits(binStr, netBits) {
      let html = "";
      for (let i = 0; i < 32; i++) {
        if (i > 0 && i % 8 === 0) html += '<span class="host">.</span>';
        html += '<span class="' + (i < netBits ? "net" : "host") + '">' + binStr[i] + "</span>";
      }
      return html;
    }

    function subnetFail(msg) {
      $("sn-network").textContent = "–";
      $("sn-results").innerHTML = "";
      $("sn-binary").innerHTML = "";
      $("sn-warn").style.display = "block";
      $("sn-warn").querySelector("span").textContent = msg;
    }

    ipEl.addEventListener("input", update);
    prefixEl.addEventListener("input", update);
    maskEl.addEventListener("input", update);
    update();
  }

  /* =====================================================
     MODUL 4 – PAKET-SIMULATOR
     ===================================================== */
  const PK_NODES = [
    { id: "pc", label: "Client", sub: "192.168.0.20", x: 0.09, color: "#3aff8c" },
    { id: "sw", label: "Switch", sub: "Layer 2", x: 0.36, color: "#00bfff" },
    { id: "rtr", label: "Router", sub: "192.168.0.1", x: 0.63, color: "#ff9d5c" },
    { id: "srv", label: "Server", sub: "example.com", x: 0.9, color: "#c9a0ff" }
  ];

  const PK_SCENARIOS = {
    arp: {
      label: "ARP – Adresse auflösen",
      caption: "ARP (Address Resolution Protocol): IP-Adresse → MAC-Adresse, damit Layer 2-Frames adressiert werden können.",
      steps: [
        { from: "pc", to: "sw", proto: "ARP Request", color: "#ffd43b", info: "„Wer hat 192.168.0.10? Sag 192.168.0.20“ – als Broadcast an FF:FF:FF:FF:FF:FF", explain: "Der Client kennt die IP des Ziels, aber nicht die MAC. Die Anfrage geht als Broadcast an ALLE Geräte im Segment." },
        { from: "sw", to: "srv", proto: "ARP Request", color: "#ffd43b", info: "Broadcast wird an alle Ports weitergeleitet", explain: "Der Switch flutet den Broadcast an alle angeschlossenen Geräte (Broadcast ist Layer-2-weit)." },
        { from: "srv", to: "pc", proto: "ARP Reply", color: "#3aff8c", info: "„192.168.0.10 ist mir! MAC: AA:BB:CC:01:02:03“ – direkt an den Fragesteller", explain: "Nur das Ziel antwortet – mit seiner MAC-Adresse. Der Client speichert das Mapping im ARP-Cache (ca. 2–20 min)." }
      ]
    },
    dhcp: {
      label: "DHCP – DORA (IP bekommen)",
      caption: "DHCP Discover – Offer – Request – ACK: So bekommt ein neues Gerät automatisch eine IP-Adresse.",
      steps: [
        { from: "pc", to: "sw", proto: "DHCP Discover", color: "#ffd43b", info: "Broadcast von 0.0.0.0:255.255.255.255 – „Ich bin neu, wer vergibt Adressen?“", explain: "Das Gerät hat noch keine IP – deshalb sendet es mit 0.0.0.0 als Quelle an die Broadcast-Adresse." },
        { from: "rtr", to: "pc", proto: "DHCP Offer", color: "#7fd4ff", info: "Router (DHCP-Server) bietet an: 192.168.0.20, Maske 255.255.255.0, Gateway .1, DNS .1, Lease 24 h", explain: "Der DHCP-Server hat eine freie Adresse aus seinem Pool gewählt und macht ein Angebot." },
        { from: "pc", to: "sw", proto: "DHCP Request", color: "#ffd43b", info: "Broadcast: „Ich nehme das Angebot 192.168.0.20 an“", explain: "Der Request geht als Broadcast, damit auch andere DHCP-Server wissen, dass ihr Angebot nicht gewählt wurde." },
        { from: "rtr", to: "pc", proto: "DHCP ACK", color: "#3aff8c", info: "Bestätigung: Adresse ist gültig bis Lease-Ende", explain: "Ab jetzt darf der Client die Adresse nutzen und ist vollständiges Netzmitglied." }
      ]
    },
    dns: {
      label: "DNS – Name auflösen",
      caption: "DNS (Domain Name System): google.com → IP-Adresse, damit TCP eine Verbindung aufbauen kann.",
      steps: [
        { from: "pc", to: "rtr", proto: "DNS Query (UDP 53)", color: "#7fd4ff", info: "„A? example.com.“ – rekursive Anfrage an den DNS-Server (Router/Resolver)", explain: "Der Client fragt seinen konfigurierten DNS-Resolver – typischerweise der Router, der weiterleitet." },
        { from: "rtr", to: "srv", proto: "Weiterleitung", color: "#ffd43b", info: "Resolver fragt Root → TLD → Authoritative Server (Kaskade, hier zusammengefasst)", explain: "Der Resolver geht die DNS-Hierarchie durch: Root-Server (.), TLD-Server (.com), dann der Nameserver der Domain." },
        { from: "rtr", to: "pc", proto: "DNS Answer", color: "#3aff8c", info: "„example.com = 93.184.216.34 (TTL 3600)“", explain: "Die Antwort wird im Resolver- und Client-Cache gespeichert – weitere Abfragen laufen aus dem Cache." }
      ]
    },
    tcp: {
      label: "TCP – Three-Way-Handshake",
      caption: "TCP: verbindungsorientiert – bevor Daten fließen, stimmen sich beide Seiten über Sequenznummern ab.",
      steps: [
        { from: "pc", to: "srv", proto: "TCP SYN", color: "#7fd4ff", info: "Client → Server :80, SEQ=1000, SYN=1 – „Verbindungsaufbau?“", explain: "Der Client wählt eine zufällige Start-Sequenznummer und bittet um eine Verbindung." },
        { from: "srv", to: "pc", proto: "TCP SYN-ACK", color: "#ffd43b", info: "Server → Client, SEQ=5000, ACK=1001, SYN=1 – „Ja! Meine Nummer ist 5000, deine erwartete ist 1001“", explain: "Der Server bestätigt die Nummer des Clients (+1) und legt seine eigene vor." },
        { from: "pc", to: "srv", proto: "TCP ACK", color: "#3aff8c", info: "Client → Server, ACK=5001 – Verbindung ESTABLISHED", explain: "Beide Seiten kennen jetzt die Sequenznummern – verlorene Pakete können erkannt und wiederholt werden." }
      ]
    },
    http: {
      label: "HTTP – Anfrage & Antwort",
      caption: "HTTP läuft über eine bestehende TCP-Verbindung (der Handshake ist bereits erledigt).",
      steps: [
        { from: "pc", to: "srv", proto: "HTTP GET", color: "#7fd4ff", info: "GET / HTTP/1.1 · Host: example.com · Accept: text/html", explain: "Der Client fordert eine Ressource an – Pfad, Header und gewünschter Inhaltstyp sind im Request enthalten." },
        { from: "srv", to: "pc", proto: "HTTP 200 OK", color: "#3aff8c", info: "HTTP/1.1 200 OK · Content-Type: text/html · Content-Length: 1256 → <html>…", explain: "Der Server antwortet mit Statuscode, Headern und dem Inhalt. 200 = alles gut, 404 = nicht gefunden, 301 = umgezogen." }
      ]
    },
    icmp: {
      label: "ICMP – Ping",
      caption: "ICMP (Internet Control Message Protocol): Fehlermeldungen und Diagnose – kein Datentransport.",
      steps: [
        { from: "pc", to: "srv", proto: "ICMP Echo Request", color: "#7fd4ff", info: "Type 8, Code 0, Identifier/Sequenz – „Bist du da?“", explain: "Ping sendet ein Echo Request mit einer Sequenznummer – die Antwort misst die Laufzeit." },
        { from: "srv", to: "pc", proto: "ICMP Echo Reply", color: "#3aff8c", info: "Type 0, Code 0, gleiche Sequenz – „Ja, in 0,4 ms“", explain: "Die identische Sequenznummer erlaubt es dem Client, Antwort und Anfrage zu paaren und die Zeit zu messen." }
      ]
    }
  };

  const pk = { scenario: null, step: 0, playing: false, dot: null };

  function pkInit() {
    const sel = $("pk-scenario");
    Object.keys(PK_SCENARIOS).forEach(function (key) {
      const opt = document.createElement("option");
      opt.value = key;
      opt.textContent = PK_SCENARIOS[key].label;
      sel.appendChild(opt);
    });
    sel.addEventListener("change", pkReset);
    $("pk-play").addEventListener("click", function () { pkPlay(); });
    $("pk-step").addEventListener("click", function () { pkStep(); });
    $("pk-reset").addEventListener("click", pkReset);
    pkReset();
  }

  function pkReset() {
    pk.scenario = PK_SCENARIOS[$("pk-scenario").value];
    pk.step = 0;
    pk.playing = false;
    $("pk-table").querySelector("tbody").innerHTML = "";
    $("pk-current").innerHTML = '<span class="p-badge" style="border-color:#6b7785;color:#9aa5b1;">Bereit</span> Wähle ein Szenario und drücke „Abspielen“ oder „Einzelschritt“.';
    $("pk-caption").textContent = pk.scenario.caption;
    pkRenderBase();
  }

  function pkNodeX(id) {
    for (let i = 0; i < PK_NODES.length; i++) if (PK_NODES[i].id === id) return PK_NODES[i].x;
    return 0.5;
  }

  function pkRenderBase() {
    const cv = setupCanvas("pk-canvas");
    const size = cv.fit();
    const ctx = cv.ctx;
    ctx.fillStyle = "#0a0f14";
    ctx.fillRect(0, 0, size.w, size.h);
    const mid = size.h * 0.52;

    ctx.strokeStyle = "rgba(0,191,255,0.4)";
    ctx.lineWidth = 2.4;
    ctx.beginPath();
    ctx.moveTo(size.w * 0.09, mid);
    ctx.lineTo(size.w * 0.91, mid);
    ctx.stroke();

    PK_NODES.forEach(function (n) {
      const x = size.w * n.x;
      ctx.beginPath();
      ctx.fillStyle = "#101a22";
      ctx.strokeStyle = n.color;
      ctx.lineWidth = 2;
      ctx.arc(x, mid, 24, 0, Math.PI * 2);
      ctx.fill(); ctx.stroke();
      ctx.fillStyle = n.color;
      ctx.font = "700 13px Consolas, monospace";
      ctx.textAlign = "center";
      ctx.fillText(n.label.toUpperCase().slice(0, 3), x, mid + 4);
      ctx.font = "11px Consolas, monospace";
      ctx.fillStyle = "#9aa5b1";
      ctx.fillText(n.label, x, mid + 44);
      ctx.fillStyle = "#6b7785";
      ctx.fillText(n.sub, x, mid + 58);
      ctx.textAlign = "left";
    });
  }

  function pkAnimateStep(stepObj, done) {
    const cv = setupCanvas("pk-canvas");
    const size = cv.fit();
    const ctx = cv.ctx;
    const mid = size.h * 0.52;
    const xFrom = size.w * pkNodeX(stepObj.from);
    const xTo = size.w * pkNodeX(stepObj.to);
    const t0 = performance.now();
    const dur = 620;

    function frame(now) {
      const t = Math.min(1, (now - t0) / dur);
      pkRenderBase();
      const x = xFrom + (xTo - xFrom) * t;
      ctx.beginPath();
      ctx.fillStyle = stepObj.color;
      ctx.shadowColor = stepObj.color;
      ctx.shadowBlur = 16;
      ctx.arc(x, mid, 9, 0, Math.PI * 2);
      ctx.fill();
      ctx.shadowBlur = 0;
      ctx.fillStyle = "rgba(229,244,255,0.9)";
      ctx.font = "11px Consolas, monospace";
      ctx.textAlign = "center";
      ctx.fillText(stepObj.proto, x, mid - 20);
      ctx.textAlign = "left";
      if (t < 1) window.requestAnimationFrame(frame);
      else done();
    }
    window.requestAnimationFrame(frame);
  }

  function pkApplyStep() {
    const steps = pk.scenario.steps;
    if (pk.step >= steps.length) {
      pk.playing = false;
      $("pk-current").innerHTML = '<span class="p-badge" style="border-color:#3aff8c;color:#3aff8c;">Fertig</span> Szenario abgeschlossen – „Zurücksetzen“ für neuen Durchlauf.';
      return true;
    }
    const stepObj = steps[pk.step];
    pkAnimateStep(stepObj, function () {
      pk.step++;
      $("pk-current").innerHTML =
        '<span class="p-badge">' + esc(stepObj.proto) + "</span> <strong>" + esc(stepObj.info) + "</strong>" +
        '<div style="color:#9aa5b1; font-size:13.5px; margin-top:4px;">' + esc(stepObj.explain) + "</div>";

      const tbody = $("pk-table").querySelector("tbody");
      const row = document.createElement("tr");
      const fromLabel = (PK_NODES.find(function (n) { return n.id === stepObj.from; }) || {}).label || stepObj.from;
      const toLabel = (PK_NODES.find(function (n) { return n.id === stepObj.to; }) || {}).label || stepObj.to;
      row.innerHTML = "<td>" + pk.step + "</td><td class='hl'>" + esc(fromLabel) + "</td><td>" + esc(toLabel) +
        "</td><td>" + esc(stepObj.proto) + "</td><td>" + esc(stepObj.info) + "</td>";
      tbody.appendChild(row);

      if (pk.playing && pk.step < steps.length) {
        window.setTimeout(function () { if (pk.playing) pkApplyStep(); }, 1100);
      } else if (pk.step >= steps.length) {
        pk.playing = false;
        $("pk-current").innerHTML = '<span class="p-badge" style="border-color:#3aff8c;color:#3aff8c;">Fertig</span> Szenario abgeschlossen – „Zurücksetzen“ für neuen Durchlauf.';
      }
    });
    return false;
  }

  function pkPlay() {
    if (pk.playing) return;
    if (pk.step >= pk.scenario.steps.length) pkReset();
    pk.playing = true;
    pkApplyStep();
  }

  function pkStep() {
    pk.playing = false;
    if (pk.step >= pk.scenario.steps.length) return;
    pkApplyStep();
  }

  /* =====================================================
     MODUL 5 – VIRTUELLES TERMINAL (rein simuliert)
     ===================================================== */
  const DEMO_NET = {
    hosts: {
      "192.168.0.1": { name: "fritz.box", type: "Router", mac: "A8:16:B2:11:22:33" },
      "192.168.0.4": { name: "pi-core.home", type: "Raspberry Pi", mac: "DC:A6:32:44:55:66" },
      "192.168.0.20": { name: "laptop.home", type: "Laptop", mac: "3C:22:FB:77:88:99" },
      "192.168.0.42": { name: "kali-pi.home", type: "Raspberry Pi (Kali)", mac: "DC:A6:32:AA:BB:CC" },
      "192.168.0.50": { name: "repeater.home", type: "WLAN-Repeater", mac: "B4:30:24:DD:EE:FF" },
      "192.168.0.86": { name: "pi-media.home", type: "Raspberry Pi", mac: "DC:A6:32:12:34:56" }
    },
    dns: {
      "pi-core.home": "192.168.0.4",
      "google.com": "142.250.185.78",
      "example.com": "93.184.216.34",
      "wikipedia.org": "185.15.59.224",
      "github.com": "140.82.121.4"
    }
  };

  function initTerminal() {
    const out = $("term-out"), input = $("term-in");
    termPrint("Los-Finkos simuliertes Terminal (pi@raspberrypi) – Demo-Netzwerk 192.168.0.0/24.", "dim");
    termPrint("Alles rein simuliert: es werden keine echten Befehle ausgeführt. „help“ zeigt alle Befehle.", "dim");

    input.addEventListener("keydown", function (e) {
      if (e.key !== "Enter") return;
      const line = input.value.trim();
      input.value = "";
      if (!line) return;
      termPrint("pi@raspberrypi:~$ " + line, "cmd");
      termExecute(line);
    });

    function termPrint(text, cls) {
      const div = document.createElement("div");
      if (cls) div.className = cls;
      div.textContent = text;
      out.appendChild(div);
      out.scrollTop = out.scrollHeight;
    }

    function resolveHost(token) {
      if (/^\d{1,3}(\.\d{1,3}){3}$/.test(token)) {
        return { ip: token, info: DEMO_NET.hosts[token] };
      }
      // Hostname/IP-Kurzform ("pi-core" oder "0.4")
      if (DEMO_NET.dns[token]) return { ip: DEMO_NET.dns[token], info: DEMO_NET.hosts[DEMO_NET.dns[token]] };
      const short = token.replace(/\.home$/, "");
      const byName = Object.keys(DEMO_NET.hosts).find(function (ip) {
        return DEMO_NET.hosts[ip].name.indexOf(short) !== -1;
      });
      if (byName) return { ip: byName, info: DEMO_NET.hosts[byName] };
      return null;
    }

    function termExecute(line) {
      const parts = line.split(/\s+/);
      const cmd = parts[0].toLowerCase();
      const arg = parts.slice(1).join(" ");

      if (cmd === "clear") { out.innerHTML = ""; return; }

      if (cmd === "help") {
        termPrint("Verfügbare (simulierte) Befehle:", "dim");
        ["ping <host|ip>          – 4 ICMP-Pings im Demo-Netz",
         "ip addr                 – Netzwerk-Interfaces des Pi",
         "ip route                – Routing-Tabelle",
         "traceroute <host|ip>    – Route zum Ziel",
         "nslookup <name>         – DNS-Abfrage (Demo-Namen: pi-core.home, google.com, …)",
         "dig <name>              – detaillierte DNS-Antwort",
         "ss                      – offene Ports (Simulate)",
         "arp                     – ARP-Tabelle",
         "hostname                – Gerätename",
         "clear                   – Bildschirm leeren"].forEach(function (l) { termPrint("  " + l); });
        return;
      }

      if (cmd === "hostname") { termPrint("raspberrypi"); return; }

      if (cmd === "ip") {
        if (arg === "addr" || arg === "a") {
          termPrint("1: lo: <LOOPBACK,UP,LOWER_UP> mtu 65536");
          termPrint("    inet 127.0.0.1/8 scope host lo");
          termPrint("2: eth0: <BROADCAST,MULTICAST,UP,LOWER_UP> mtu 1500");
          termPrint("    inet 192.168.0.4/24 brd 192.168.0.255 scope global eth0");
          termPrint("    link/ether dc:a6:32:44:55:66");
          termPrint("3: wlan0: <BROADCAST,MULTICAST> mtu 1500  (nicht verbunden)");
        } else if (arg === "route" || arg === "r") {
          termPrint("default via 192.168.0.1 dev eth0 proto dhcp metric 100");
          termPrint("192.168.0.0/24 dev eth0 proto kernel scope link src 192.168.0.4");
        } else {
          termPrint("Usage: ip addr | ip route", "err");
        }
        return;
      }

      if (cmd === "ping") {
        if (!arg) { termPrint("Usage: ping <host|ip>", "err"); return; }
        const target = resolveHost(arg);
        if (!target) { termPrint("ping: " + arg + ": Name oder Dienst nicht bekannt (nur Demo-Hosts)", "err"); return; }
        termPrint("PING " + target.ip + " (" + target.ip + ") 56(84) bytes of data.");
        let seq;
        for (seq = 1; seq <= 4; seq++) {
          (function (s) {
            window.setTimeout(function () {
              const jitter = target.ip === "192.168.0.50" || target.ip === "192.168.0.86" ? 3 + Math.random() * 9 : 0.3 + Math.random() * 0.6;
              termPrint("64 bytes from " + target.ip + ": icmp_seq=" + s + " ttl=64 time=" + fmt(jitter, 1) + " ms", "ok");
              if (s === 4) termPrint("--- " + target.ip + " Ping-Statistik --- 4 gesendet, 4 empfangen, 0 % Paketverlust (simuliert)", "dim");
            }, s * 450);
          })(seq);
        }
        return;
      }

      if (cmd === "traceroute") {
        if (!arg) { termPrint("Usage: traceroute <host|ip>", "err"); return; }
        const target = resolveHost(arg);
        if (!target) { termPrint("traceroute: Host " + arg + " nicht bekannt", "err"); return; }
        termPrint("traceroute to " + target.ip + ", 30 hops max (simuliert)");
        termPrint(" 1  fritz.box (192.168.0.1)  0,4 ms");
        if (target.ip === "192.168.0.50" || target.ip === "192.168.0.86") {
          termPrint(" 2  repeater.home (192.168.0.50)  3,1 ms");
          termPrint(" 3  " + target.ip + "  6,2 ms");
        } else {
          termPrint(" 2  " + target.ip + "  0,8 ms");
        }
        return;
      }

      if (cmd === "nslookup" || cmd === "dig") {
        if (!arg) { termPrint("Usage: " + cmd + " <name>", "err"); return; }
        const ip = DEMO_NET.dns[arg];
        if (!ip) {
          termPrint("** server can't find " + arg + ": NXDOMAIN", "err");
          termPrint("(Demo-DNS kennt nur: " + Object.keys(DEMO_NET.dns).join(", ") + ")", "dim");
          return;
        }
        if (cmd === "nslookup") {
          termPrint("Server:\t\tfritz.box");
          termPrint("Address:\t192.168.0.1#53");
          termPrint("");
          termPrint("Name:      " + arg);
          termPrint("Address 1: " + ip);
        } else {
          termPrint("; <<>> Demo-DiG 9.18 <<>> " + arg);
          termPrint(";; ANSWER SECTION:");
          termPrint(arg + ".\t\t300\tIN\tA\t" + ip);
          termPrint(";; Query time: 2 msec ;; SERVER: 192.168.0.1#53");
        }
        return;
      }

      if (cmd === "ss") {
        termPrint("Netid  State   Local Address:Port   Process");
        termPrint("tcp    LISTEN  0.0.0.0:22            sshd");
        termPrint("tcp    LISTEN  0.0.0.0:80            nginx (Demo-Webserver)");
        termPrint("tcp    ESTAB    192.168.0.4:22  192.168.0.20:51022  (SSH-Sitzung Laptop)");
        return;
      }

      if (cmd === "arp") {
        termPrint("Address          HWtype  HWaddress           Flags  Interface");
        Object.keys(DEMO_NET.hosts).forEach(function (ip) {
          if (ip === "192.168.0.4") return;
          const h = DEMO_NET.hosts[ip];
          termPrint(ip.padEnd(17) + "ether   " + h.mac + "   CM    eth0");
        });
        return;
      }

      termPrint("bash: " + cmd + ": command not found – probiere „help“", "err");
    }

    window.setTimeout(function () { input.focus({ preventScroll: true }); }, 300);
  }

  /* =====================================================
     MODUL 6 – TOPOLOGIEN
     ===================================================== */
  const TOPOS = {
    stern: {
      label: "Stern",
      svg: function () {
        const nodes = [[210, 40, "PC 1"], [60, 120, "PC 2"], [210, 200, "PC 3"], [360, 120, "PC 4"], [210, 120, "Switch"]];
        const edges = [[4, 0], [4, 1], [4, 2], [4, 3]];
        return { nodes: nodes, edges: edges, hub: 4 };
      },
      pros: ["Einfach zu planen und erweitern", "Ein Gerätedefekt betrifft nur dieses Gerät", "Fehler leicht zu finden (am Switch sichtbar)"],
      cons: ["Switch ist Single Point of Failure", "Kabelaufwand: pro Gerät ein Kabel", "Switch-Port-Anzahl begrenzt das Netz"]
    },
    ring: {
      label: "Ring",
      svg: function () {
        const c = [210, 120], r = 85;
        const nodes = [];
        for (let i = 0; i < 6; i++) {
          const a = (i / 6) * Math.PI * 2 - Math.PI / 2;
          nodes.push([c[0] + Math.cos(a) * r * 1.35, c[1] + Math.sin(a) * r, "PC " + (i + 1)]);
        }
        const edges = [];
        for (let i = 0; i < 6; i++) edges.push([i, (i + 1) % 6]);
        return { nodes: nodes, edges: edges };
      },
      pros: ["Kein zentraler Knoten nötig", "Doppelring kann Ausfälle umleiten (Provider-Netze)", "Vorhersagbare Laufzeiten (Token Ring)"],
      cons: ["Ein Kabelriss zerlegt den einfachen Ring", "Daten müssen oft über andere Stationen", "Aufwändige Erweiterung/Neuverkabelung"]
    },
    bus: {
      label: "Bus",
      svg: function () {
        const nodes = [[40, 120, "PC 1"], [130, 120, "PC 2"], [220, 120, "PC 3"], [310, 120, "PC 4"], [400, 120, "PC 5"]];
        const edges = [[0, 1], [1, 2], [2, 3], [3, 4]];
        return { nodes: nodes, edges: edges };
      },
      pros: ["Sehr wenig Kabel", "Historisch günstig (Koax)", "Einfacher Aufbau"],
      cons: ["Kabelbruch = Totalschaden", "Alle teilen sich die Bandbreite (Kollisionen)", "Heute praktisch nur noch in Feldbussen (CAN, RS-485)"]
    },
    mesh: {
      label: "Mesh",
      svg: function () {
        const nodes = [[60, 60, "A"], [360, 60, "B"], [60, 190, "C"], [360, 190, "D"], [210, 120, "E"]];
        const edges = [[0, 1], [0, 2], [0, 3], [0, 4], [1, 2], [1, 3], [1, 4], [2, 3], [2, 4], [3, 4]];
        return { nodes: nodes, edges: edges };
      },
      pros: ["Sehr ausfallsicher – viele Ersatzwege", "Kein Single Point of Failure", "Skalierbar (WLAN-Mesh, Mesh-Routing)"],
      cons: ["Viele Verbindungen = hoher Aufwand/Kosten", "Routing-Komplexität", "Bei vollen n(n−1)/2-Verbindungen schnell unpraktisch"]
    },
    baum: {
      label: "Baum",
      svg: function () {
        const nodes = [[210, 35, "Router"], [80, 115, "Switch A"], [340, 115, "Switch B"], [30, 195, "PC 1"], [130, 195, "PC 2"], [290, 195, "PC 3"], [390, 195, "PC 4"]];
        const edges = [[0, 1], [0, 2], [1, 3], [1, 4], [2, 5], [2, 6]];
        return { nodes: nodes, edges: edges };
      },
      pros: ["Skaliert gut für Gebäude/Etagen", "Logische Struktur (Kern → Verteilung → Zugang)", "Fehler eingrenzbar pro Teilbaum"],
      cons: ["Höhere Ebenen sind kritisch (Ausfall oben = unten still)", "Mehr aktive Geräte (Switches)", "Kabel- und Portkosten auf jeder Ebene"]
    }
  };

  function initTopologien() {
    const tabs = $("topo-tabs");
    Object.keys(TOPOS).forEach(function (key, index) {
      const btn = document.createElement("button");
      btn.type = "button";
      btn.textContent = TOPOS[key].label;
      if (index === 0) btn.classList.add("active");
      btn.addEventListener("click", function () {
        Array.prototype.forEach.call(tabs.children, function (b) { b.classList.remove("active"); });
        btn.classList.add("active");
        renderTopo(key);
      });
      tabs.appendChild(btn);
    });
    renderTopo("stern");

    function renderTopo(key) {
      const t = TOPOS[key];
      const data = t.svg();
      let svg = '<svg viewBox="0 0 440 240" role="img" aria-label="Topologie ' + esc(t.label) + '">';
      data.edges.forEach(function (e) {
        svg += '<line x1="' + data.nodes[e[0]][0] + '" y1="' + data.nodes[e[0]][1] + '" x2="' + data.nodes[e[1]][0] + '" y2="' + data.nodes[e[1]][1] + '" stroke="rgba(0,191,255,0.55)" stroke-width="2.4"/>';
      });
      data.nodes.forEach(function (n) {
        svg += '<circle cx="' + n[0] + '" cy="' + n[1] + '" r="20" fill="#101a22" stroke="#00bfff" stroke-width="2"/>';
        svg += '<text x="' + n[0] + '" y="' + (n[1] + 36) + '" text-anchor="middle" style="font:11.5px Segoe UI; fill:#c9d1d9;">' + esc(n[2]) + "</text>";
      });
      svg += "</svg>";
      $("topo-svg").innerHTML = svg;
      $("topo-pros").innerHTML = t.pros.map(function (p) { return "<li>" + esc(p) + "</li>"; }).join("");
      $("topo-cons").innerHTML = t.cons.map(function (p) { return "<li>" + esc(p) + "</li>"; }).join("");
    }
  }

  /* =====================================================
     MODUL 7 – WLAN
     ===================================================== */
  function initWlan() {
    $("wlan-bands").innerHTML =
      card("fa-tower-cell", "2,4 GHz", "Reichweite", "Geht durch Wände, reicht weit – aber nur ~3 nicht überlappende Kanäle (1, 6, 11) und viele Störquellen (Mikrowelle, Bluetooth). Max. real ~100–300 Mbit/s.") +
      card("fa-tower-broadcast", "5 GHz", "Tempo", "Deutlich schneller (Wi-Fi 5/6: real 400–1200 Mbit/s), weniger Störungen, kürzere Reichweite. Viele Kanäle, DFS-Regeln zu beachten.") +
      card("fa-satellite-dish", "6 GHz", "WiFi 6E", "Neues, noch „leeres“ Band – keine Altgeräte, sehr sauber und schnell. Reichweite am kürzesten, Geräte ab Wi-Fi 6E.");

    $("wlan-more").innerHTML =
      card("fa-tag", "SSID", "Netzwerkname", "Der Name, den Geräte sehen. Ein AP kann mehrere SSIDs gleichzeitig ausstrahlen (z. B. Heim + Gast) – mit getrennten Netzen/Regeln.") +
      card("fa-shield-halved", "WPA2 vs. WPA3", "Verschlüsselung", "WPA2 (AES/CCMP) ist Standard, aber wörterbuch-anfällig bei schwachen Passwörtern. WPA3 (SAE) macht Passwort-Raten deutlich schwerer – immer WPA3 wählen, wenn alle Geräte es können.") +
      card("fa-arrows-rotate", "AP vs. Repeater", "Rollenclearheit", "Access Point = eigentliche Funkzelle (an Switch/Router angebunden). Repeater = verlängert ein bestehendes WLAN, arbeitet oft auf halbem Duplex und kostet Durchsatz. Besser: APs per Kabel verbinden.") +
      card("fa-signal", "dBm", "Logarithmisch", "Empfangsstärke in dBm (negativ!). −50 dBm ist stark, −85 dBm schwach. +3 dB = doppelte Leistung. Jede Wand kostet je nach Material 3–15 dB.");

    drawWlanChannels("2.4");

    const meterFill = $("wlan-meter-fill");
    function updateDbm() {
      const v = Number($("wlan-dbm").value);
      $("wlan-dbm-val").textContent = "−" + Math.abs(v) + " dBm";
      const t = (v + 100) / 70; // -100..-30 -> 0..1
      meterFill.style.width = (t * 100).toFixed(0) + "%";
      let q, note, color;
      if (v >= -50) { q = "Exzellent 💪"; note = "Direkt neben dem AP – volle Geschwindigkeit möglich."; color = "#00e5ff"; }
      else if (v >= -60) { q = "Sehr gut"; note = "Gleicher Raum oder Sichtlinie – ideal für Streaming."; color = "#00c9a7"; }
      else if (v >= -70) { q = "Gut"; note = "Normale Wohnungsweite – für alles außer große Downloads ausreichend."; color = "#8fbf4d"; }
      else if (v >= -80) { q = "Brauchbar"; note = "Mehrere Wände – Geschwindigkeit fällt merklich ab."; color = "#ffd43b"; }
      else if (v >= -90) { q = "Schwach"; note = "Am Rand der Reichweite – Verbindungsabbrüche drohen."; color = "#ff9d5c"; }
      else { q = "Kein brauchbares Signal"; note = "Repeater/AP-Verstärkung oder Standortwechsel nötig."; color = "#ff6b35"; }
      $("wlan-quality").textContent = q;
      $("wlan-quality").style.color = color;
      $("wlan-quality-note").textContent = note;
    }
    $("wlan-dbm").addEventListener("input", updateDbm);
    updateDbm();
  }

  function drawWlanChannels(band) {
    const cv = setupCanvas("wlan-channels");
    const size = cv.fit();
    const ctx = cv.ctx;
    ctx.fillStyle = "#0a0f14";
    ctx.fillRect(0, 0, size.w, size.h);

    if (band !== "2.4") return; // nur 2,4 GHz wird gezeichnet (5/6 GHz in den Karten erklärt)

    const left = 50, right = size.w - 20, top = 20, bottom = size.h - 34;
    const axisW = right - left;
    const fMin = 2392, fMax = 2512; // MHz
    const xFor = function (f) { return left + ((f - fMin) / (fMax - fMin)) * axisW; };

    ctx.strokeStyle = "rgba(0,191,255,0.25)";
    ctx.beginPath(); ctx.moveTo(left, bottom); ctx.lineTo(right, bottom); ctx.stroke();

    const channels = [1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11, 12, 13];
    channels.forEach(function (ch) {
      const center = 2412 + (ch - 1) * 5;
      const wHalf = 11; // ±11 MHz sichtbar (20 MHz Kanal)
      const x0 = xFor(center - wHalf), x1 = xFor(center + wHalf);
      const w = x1 - x0;
      const isMain = ch === 1 || ch === 6 || ch === 11;
      const grad = ctx.createLinearGradient(x0, 0, x1, 0);
      if (isMain) { grad.addColorStop(0, "rgba(58,255,140,0.15)"); grad.addColorStop(0.5, "rgba(58,255,140,0.6)"); grad.addColorStop(1, "rgba(58,255,140,0.15)"); }
      else { grad.addColorStop(0, "rgba(0,191,255,0.06)"); grad.addColorStop(0.5, "rgba(0,191,255,0.3)"); grad.addColorStop(1, "rgba(0,191,255,0.06)"); }
      ctx.fillStyle = grad;
      ctx.fillRect(x0, top, w, bottom - top);
      ctx.fillStyle = isMain ? "#3aff8c" : "rgba(0,191,255,0.6)";
      ctx.font = "10.5px Consolas, monospace";
      ctx.textAlign = "center";
      ctx.fillText(String(ch), xFor(center), bottom + 14);
      ctx.textAlign = "left";
    });

    ctx.fillStyle = "rgba(229,244,255,0.8)";
    ctx.font = "11px Consolas, monospace";
    ctx.fillText("Frequenz (MHz) →  2412 … 2472", left, size.h - 6);
    ctx.fillStyle = "#3aff8c";
    ctx.fillText("Grün = überlappungsfrei (1, 6, 11) · Blau = überlappend", left + 180, size.h - 6);
  }

  /* =====================================================
     MODUL 8 – QUIZ (30+ Fragen, localStorage)
     ===================================================== */
  const QUIZ_QUESTIONS = [
    // ---- Leicht (1) ----
    { d: 1, q: "Was macht ein Router?", o: ["Er verstärkt nur das WLAN", "Er verbindet verschiedene Netzwerke und leitet Pakete zwischen ihnen", "Er speichert Dateien", "Er ersetzt den Switch komplett"], a: 1, e: "Der Router arbeitet auf Layer 3 und verbindet Netzwerke (z. B. Heim-LAN ↔ Internet) anhand von IP-Adressen." },
    { d: 1, q: "Wie viele Bits hat eine IPv4-Adresse?", o: ["16", "32", "64", "128"], a: 1, e: "IPv4 = 32 Bit = 4 Blöcke à 8 Bit (z. B. 192.168.0.1)." },
    { d: 1, q: "Wofür steht DHCP?", o: ["Dynamic Host Configuration Protocol", "Data Host Control Port", "Domain Hosting Control Program", "Direct Host Communication Protocol"], a: 0, e: "DHCP vergibt automatisch IP-Adresse, Subnetzmaske, Gateway und DNS-Server an neue Geräte." },
    { d: 1, q: "Welches Protokoll übersetzt Namen wie google.com in IP-Adressen?", o: ["DHCP", "DNS", "ARP", "FTP"], a: 1, e: "DNS = Domain Name System – das „Telefonbuch“ des Internets." },
    { d: 1, q: "Was beschreibt die MAC-Adresse?", o: ["Die Adresse im Internet", "Die Hardware-Adresse eines Netzwerkadapters (Layer 2)", "Einen Router-Typ", "Ein Verschlüsselungsverfahren"], a: 1, e: "MAC = Media Access Control, z. B. A8:16:B2:3C:41:07 – nur im lokalen Netz von Bedeutung." },
    { d: 1, q: "Ein Switch arbeitet hauptsächlich auf welcher OSI-Schicht?", o: ["Schicht 1", "Schicht 2", "Schicht 3", "Schicht 7"], a: 1, e: "Switches leiten Frames anhand der MAC-Adresse → Schicht 2 (Sicherungsschicht)." },
    { d: 1, q: "Wofür steht WLAN-SSID?", o: ["Der Netzwerkname", "Das WLAN-Passwort", "Die MAC-Adresse", "Ein Kanal"], a: 0, e: "SSID = Service Set Identifier – der sichtbare Name des WLANs." },
    { d: 1, q: "Welche Bandbreite nutzt klassisches WLAN 2,4 GHz?", o: ["2,4 Mbit/s", "Das 2,4-GHz-Frequenzband", "24 Kanäle", "24 Volt"], a: 1, e: "2,4 GHz bezeichnet das Frequenzband – nicht eine Geschwindigkeit." },
    { d: 1, q: "Was ist der Unterschied zwischen TCP und UDP?", o: ["TCP ist kabelgebunden, UDP funk", "TCP ist zuverlässig und geordnet, UDP schnell ohne Garantie", "UDP ist sicherer als TCP", "Es gibt keinen Unterschied"], a: 1, e: "TCP: Handshake + Wiederholung (Web, SSH). UDP: schnell, ohne Garantie (Streaming, Games, DNS)." },
    { d: 1, q: "Welche Adresse ist eine PRIVATE IPv4-Adresse?", o: ["8.8.8.8", "192.168.0.4", "172.32.1.1", "142.250.185.78"], a: 1, e: "Privat (RFC 1918): 10.0.0.0/8, 172.16.0.0/12, 192.168.0.0/16. 8.8.8.8 ist öffentlich (Google-DNS)." },
    // ---- Mittel (2) ----
    { d: 2, q: "Was passiert bei einem ARP-Request?", o: ["Ein Router fragt nach DNS", "Broadcast „Wer hat diese IP?“ → Ziel antwortet mit seiner MAC", "Ein Client bucht eine IP beim DHCP", "Zwei Geräte tauschen Zertifikate"], a: 1, e: "ARP löst IP→MAC auf: Request als Broadcast (FF:FF:FF:FF:FF:FF), Reply direkt vom Ziel." },
    { d: 2, q: "In welcher Reihenfolge läuft der TCP-Three-Way-Handshake?", o: ["SYN → ACK → SYN-ACK", "SYN → SYN-ACK → ACK", "ACK → SYN → SYN-ACK", "HELLO → OK → GO"], a: 1, e: "Client SYN, Server SYN-ACK (bestätigt + eigene Nummer), Client ACK → ESTABLISHED." },
    { d: 2, q: "Was macht NAT im Heimrouter?", o: ["Verschlüsselt das WLAN", "Übersetzt zwischen privaten LAN-IPs und einer öffentlichen Adresse", "Blockiert Werbung", "Verteilt WLAN-Kanäle"], a: 1, e: "NAT (Network Address Translation) mappingt viele private IPs auf eine öffentliche Adresse – inkl. Port-Umschreibung." },
    { d: 2, q: "Welcher Port ist Standard für HTTPS?", o: ["21", "80", "443", "8080"], a: 2, e: "HTTPS = HTTP über TLS auf Port 443. HTTP nutzt 80, SSH 22, FTP 21." },
    { d: 2, q: "Was bedeutet DHCP „DORA“?", o: ["Discover, Offer, Request, ACK", "Detect, Open, Renew, Assign", "DNS, Offer, Route, Address", "Delete, Override, Rebind, Accept"], a: 0, e: "DORA = Discover (Broadcast), Offer (Angebot), Request (Annahme), ACK (Bestätigung)." },
    { d: 2, q: "Woran erkennt man die Netzadresse eines Subnetzes?", o: ["Alle Bits der Host-Portion sind 1", "Alle Bits der Host-Portion sind 0", "Sie endet immer auf .1", "Sie ist immer die kleinste ungerade Zahl"], a: 1, e: "Netzadresse = IP AND Maske → Host-Bits null. .1 ist dagegen die erste HOST-Adresse (bei /24+)." },
    { d: 2, q: "Wie viele nutzbare Hosts hat ein /26-Netz?", o: ["64", "62", "126", "30"], a: 1, e: "/26 → 2^6 = 64 Adressen − 2 (Netz + Broadcast) = 62 nutzbare Hosts." },
    { d: 2, q: "Was macht ein Repeater typischerweise negativ?", o: ["Er erhöht die Sicherheit", "Er halbiert oft den Durchsatz", "Er verändert die SSID", "Er blockiert 5 GHz"], a: 1, e: "Ein einfacher Repeater hört und sendet auf derselben Funkkarte → Half-Duplex → oft ~50 % Verlust." },
    { d: 2, q: "Was misst „dBm“ bei WLAN?", o: ["Datenrate", "Signalstärke (Leistung, logarithmisch)", "Kanalbreite", "Paketverlust"], a: 1, e: "dBm ist eine Leistung in dB bezogen auf 1 mW, immer negativ beim Empfang (−30 stark … −90 schwach)." },
    { d: 2, q: "Warum ist DNS wichtig, bevor eine Webseite lädt?", o: ["Der Browser braucht die IP für die TCP-Verbindung", "DNS verschlüsselt die Seite", "Ohne DNS ist das WLAN langsamer", "DNS prüft das Zertifikat"], a: 0, e: "Erst Name→IP (DNS), dann TCP-Handshake zur IP, dann TLS, dann HTTP. DNS ist Schritt 1." },
    { d: 2, q: "Was ist ein VLAN?", o: ["Ein drahtloses LAN", "Ein logisch getrenntes Teilnetz auf demselben Switch", "Ein Router-Modus", "Ein VPN-Protokoll"], a: 1, e: "Virtual LAN trennt Geräte logisch (Tag 802.1Q), obwohl sie physisch am selben Switch hängen." },
    // ---- Schwer (3) ----
    { d: 3, q: "Welche Broadcastadresse gehört zu 192.168.1.130/26?", o: ["192.168.1.191", "192.168.1.255", "192.168.1.128", "192.168.1.63"], a: 0, e: "/26 → Blöcke à 64: 128–191. Netz 192.168.1.128, Broadcast 192.168.1.191, Hosts .129–.190." },
    { d: 3, q: "Wie viele nutzbare Hosts hat ein /31-Netz laut RFC 3021?", o: ["0", "1", "2", "Keine – /31 ist ungültig"], a: 2, e: "/31 ist für Punkt-zu-Punkt-Strecken gedacht: 2 Adressen, beide nutzbar (keine Netz/Broadcast-Reservierung)." },
    { d: 3, q: "Was bedeutet „TTL=64“ in einer Ping-Antwort?", o: ["Die Leitung ist 64 ms lang", "Der Paket wurde max. 64 Hops weitergeleitet (Startwert OS-abhängig)", "Die MTU beträgt 64 Byte", "64 Pakete gingen verloren"], a: 1, e: "Time To Live zählt jede Router-Hop herunter (Linux startet bei 64, Windows bei 128) – verhindert Endlosschleifen." },
    { d: 3, q: "Warum ist „Zwei Geräte mit derselben IP“ problematisch?", o: ["Zu viel Traffic", "ARP-Cache-Konflikt: Antworten wechseln zwischen den Geräten", "DNS funktioniert nicht mehr", "Der Router schaltet ab"], a: 1, e: "Beide antworten auf ARP – Switches flippen den MAC-Einheitseintrag hin und her → Verbindungen brechen zufällig." },
    { d: 3, q: "Was passiert im ARP-Cache, wenn ein Gerät die IP wechselt?", o: ["Nichts – MAC zählt", "Alter Eintrag veraltet nach TTL, dann neuer Mapping", "Die MAC ändert sich mit", "Der Switch löscht alle Ports"], a: 1, e: "ARP-Einträge haben eine Lebensdauer (typ. 2–20 min). Danach fragt der Absender neu und bekommt die neue Zuordnung." },
    { d: 3, q: "Welcher Messwert beschreibt, wie viel der Original-Leistung am Kabelende ankommt?", o: ["dBm", "SNR", "Dämpfung in dB (Verlust)", "Jitter"], a: 2, e: "Die Dämpfung (Insertion Loss, dB) beschreibt den Verlust: −3 dB = halbe Leistung. Kabeldatenblätter geben dB/100 m an." },
    { d: 3, q: "Warum kann ein zweiter DHCP-Server im Netz Chaos stiften?", o: ["Er ist schneller", "Geräte bekommen widersprüchliche Adressen/Gateways von zwei Servern", "DHCP sendet verschlüsselt", "Switches leiten DHCP nicht weiter"], a: 1, e: "Zwei DHCP-Server répondieren auf Discover – der Client nimmt zufällig eines; falsche Gateway/DNS-Einträge → „komische“ Fehler." },
    { d: 3, q: "Was beschreibt der Begriff „MTU 1500“?", o: ["Maximale Paketgröße pro Frame (Payload) ohne Fragmentierung", "Die Temperatur des Chips", "Maximale拓扑größe", "Anzahl der Ports"], a: 0, e: "Maximum Transmission Unit: Standard-Ethernet 1500 Byte Payload. Größere Pakete werden fragmentiert (oder mit „Don't Fragment“ verworfen)." },
    { d: 3, q: "Warum bevorzugt man bei inkrementellen Updates „stateful“ DHCPv6/SLAAC statt Broadcast-Antworten wie bei IPv4?", o: ["IPv6 hat kein Broadcast – stattdessen Multicast und Neighbor Discovery", "IPv6 kennt keine Automatik", "UDP funktioniert bei IPv6 nicht", "Nur Router dürfen Adressen haben"], a: 0, e: "IPv6 hat Broadcast abgeschafft: Router Advertisements (Multicast) + NDP ersetzen ARP/DHCP-Broadcast-Muster." },
    { d: 3, q: "Ein Ping in ein fremdes Subnetz scheitert, ein Ping in dasselbe Subnetz klappt. Was prüfst du zuerst?", o: ["Das WLAN-Passwort", "Ob das Default-Gateway im selben Subnetz liegt und der Router routet", "Die DNS-Server", "Die MAC des Ziels"], a: 1, e: "Ohne gültiges Gateway (im eigenen Subnetz) weiß der Client nicht, wohin er fremde Netze senden soll → Routing prüfen (ip route)." }
  ];

  const quizState = { questions: [], idx: 0, score: 0, active: false };

  function quizLoadStats() {
    try { return JSON.parse(localStorage.getItem("nl_quiz_v1")) || { answered: 0, correct: 0, best: {} }; }
    catch (e) { return { answered: 0, correct: 0, best: {} }; }
  }

  function quizSaveStats(stats) {
    try { localStorage.setItem("nl_quiz_v1", JSON.stringify(stats)); } catch (e) { /* ignorieren */ }
  }

  function quizRenderIntro() {
    const stats = quizLoadStats();
    $("quiz-stats-info").innerHTML = '<i class="fas fa-database"></i> ' +
      stats.answered + " Fragen beantwortet · " + stats.correct + " richtig (" +
      (stats.answered ? Math.round(stats.correct / stats.answered * 100) : 0) + " %)";
    $("quiz-progress-wrap").style.display = "none";
    $("quiz-container").innerHTML =
      '<div class="quiz-summary"><div class="score">' + QUIZ_QUESTIONS.length + '</div>' +
      '<div class="grade">Fragen im Pool · 10 zufällige pro Runde · Fortschritt wird lokal gespeichert</div></div>';
    $("quiz-actions").style.display = "none";
  }

  function quizStart() {
    const diff = $("quiz-diff").value;
    const pool = diff === "all" ? QUIZ_QUESTIONS.slice() : QUIZ_QUESTIONS.filter(function (q) { return q.d === Number(diff); });
    // Mischen & 10 ziehen
    pool.sort(function () { return Math.random() - 0.5; });
    quizState.questions = pool.slice(0, Math.min(10, pool.length));
    quizState.idx = 0;
    quizState.score = 0;
    quizState.active = true;
    $("quiz-actions").style.display = "flex";
    quizRenderQuestion();
  }

  const DIFF_LABEL = { 1: "Leicht", 2: "Mittel", 3: "Schwer" };

  function quizRenderQuestion() {
    const total = quizState.questions.length;
    const q = quizState.questions[quizState.idx];
    $("quiz-progress-wrap").style.display = "block";
    $("quiz-progress-text").textContent = "Frage " + (quizState.idx + 1) + "/" + total;
    $("quiz-score-live").textContent = quizState.score + " Punkte";
    $("quiz-bar-fill").style.width = (quizState.idx / total * 100) + "%";

    const block = document.createElement("div");
    block.className = "quiz-question";
    block.innerHTML = '<h3><span class="qnum">' + (quizState.idx + 1) + '.</span> ' + esc(q.q) +
      '<span class="qdiff d' + q.d + '">' + DIFF_LABEL[q.d] + '</span></h3>';
    q.o.forEach(function (opt, i) {
      const label = document.createElement("label");
      label.className = "quiz-option";
      const input = document.createElement("input");
      input.type = "radio"; input.name = "nq"; input.value = String(i);
      label.appendChild(input);
      label.appendChild(document.createTextNode(opt));
      block.appendChild(label);
    });
    const explain = document.createElement("div");
    explain.className = "quiz-explain";
    block.appendChild(explain);
    $("quiz-container").innerHTML = "";
    $("quiz-container").appendChild(block);

    Array.prototype.forEach.call(block.querySelectorAll(".quiz-option"), function (label) {
      label.addEventListener("click", function () { quizAnswer(label, block, q); });
    });
  }

  function quizAnswer(label, block, q) {
    Array.prototype.forEach.call(block.querySelectorAll(".quiz-option"), function (l, i) {
      l.classList.add("locked");
      l.querySelector("input").disabled = true;
      if (i === q.a) l.classList.add("correct");
      if (l === label && i !== q.a) l.classList.add("wrong");
    });

    const chosen = Array.prototype.indexOf.call(block.querySelectorAll(".quiz-option"), label);
    const correct = chosen === q.a;
    if (correct) quizState.score++;

    const stats = quizLoadStats();
    stats.answered++; if (correct) stats.correct++;
    quizSaveStats(stats);

    const explain = block.querySelector(".quiz-explain");
    explain.style.display = "block";
    explain.innerHTML = (correct ? "✅ Richtig! " : "❌ Leider falsch – richtig wäre: <b>" + esc(q.o[q.a]) + "</b>. ") + esc(q.e);

    $("quiz-score-live").textContent = quizState.score + " Punkte";
    const nextBtn = $("quiz-next");
    nextBtn.innerHTML = quizState.idx >= quizState.questions.length - 1
      ? '<i class="fas fa-flag-checkered"></i> Auswertung'
      : '<i class="fas fa-forward"></i> Nächste Frage';
  }

  function quizNext() {
    if (!quizState.active) return;
    const block = $("quiz-container").querySelector(".quiz-question");
    const answered = block && block.querySelector(".quiz-option.locked");
    if (!answered) return; // erst antworten
    quizState.idx++;
    if (quizState.idx >= quizState.questions.length) { quizFinish(); return; }
    quizRenderQuestion();
    $("quiz-next").innerHTML = '<i class="fas fa-forward"></i> Nächste Frage';
  }

  function quizFinish() {
    quizState.active = false;
    $("quiz-actions").style.display = "none";
    const total = quizState.questions.length;
    const percent = Math.round(quizState.score / total * 100);

    const diff = $("quiz-diff").value;
    const stats = quizLoadStats();
    stats.best = stats.best || {};
    const key = diff === "all" ? "all" : diff;
    if (!stats.best[key] || quizState.score > stats.best[key]) stats.best[key] = quizState.score;
    quizSaveStats(stats);

    const grade = percent === 100 ? "🏆 Perfekt – Netzwerk-Profi!" : percent >= 80 ? "⭐ Sehr gut!" :
      percent >= 60 ? "👍 Gut – Module oben nochmal anschauen." : "📖 Weiter üben – die Grundlagen helfen!";

    $("quiz-container").innerHTML =
      '<div class="quiz-summary"><div class="score">' + quizState.score + " / " + total + " (" + percent + " %)</div>" +
      '<div class="grade">' + grade + "</div>" +
      '<div style="color:#6b7785; font-size:13px; margin-top:8px;">Bestwert in dieser Stufe: ' + (stats.best[key] || 0) + " Punkte</div></div>";
    $("quiz-bar-fill").style.width = "100%";
    $("quiz-progress-text").textContent = "Fertig!";
  }

  function initQuiz() {
    $("quiz-start").addEventListener("click", quizStart);
    $("quiz-next").addEventListener("click", quizNext);
    $("quiz-abort").addEventListener("click", quizRenderIntro);
    quizRenderIntro();
  }

  /* =====================================================
     MODUL 9 – RASPBERRY-PI-LABOR
     ===================================================== */
  const PI_DEVICES = [
    { id: "router", name: "Router", ip: "192.168.0.1", x: 420, y: 40, kind: "Router/FritzBox" },
    { id: "repeater", name: "WLAN-Repeater", ip: "192.168.0.50", x: 590, y: 140, kind: "Repeater", wifi: true },
    { id: "pi4", name: "Pi „pi-core“", ip: "192.168.0.4", x: 200, y: 150, kind: "Raspberry Pi (Ethernet)" },
    { id: "kali", name: "Kali-Pi", ip: "192.168.0.42", x: 60, y: 250, kind: "Raspberry Pi (Kali, Ethernet)" },
    { id: "laptop", name: "Laptop", ip: "192.168.0.20", x: 250, y: 255, kind: "Laptop (WLAN)", wifi: true },
    { id: "pi86", name: "Pi „pi-media“", ip: "192.168.0.86", x: 700, y: 250, kind: "Raspberry Pi (WLAN)", wifi: true }
  ];
  const PI_LINKS = [
    { a: "router", b: "pi4", type: "eth" },
    { a: "router", b: "kali", type: "eth" },
    { a: "router", b: "laptop", type: "wifi" },
    { a: "router", b: "repeater", type: "wifi" },
    { a: "repeater", b: "pi86", type: "wifi" }
  ];

  function initPiLab() {
    // SVG-Topologie
    let svg = '<svg viewBox="0 0 780 330" role="img" aria-label="Heimnetzwerk-Simulation">';
    PI_LINKS.forEach(function (l) {
      const a = PI_DEVICES.find(function (d) { return d.id === l.a; });
      const b = PI_DEVICES.find(function (d) { return d.id === l.b; });
      svg += '<line class="' + (l.type === "wifi" ? "pn-wifi" : "pn-wire") + '" x1="' + a.x + '" y1="' + a.y + '" x2="' + b.x + '" y2="' + b.y + '"/>';
      if (l.type === "wifi") {
        const mx = (a.x + b.x) / 2, my = (a.y + b.y) / 2;
        svg += '<text x="' + mx + '" y="' + (my - 6) + '" text-anchor="middle" style="font:10px Segoe UI; fill:#8e24aa;">WLAN</text>';
      }
    });
    PI_DEVICES.forEach(function (d) {
      svg += '<rect class="pn-box" x="' + (d.x - 62) + '" y="' + (d.y - 24) + '" width="124" height="48" fill="#101a22" stroke="#00bfff" stroke-width="2"/>';
      svg += '<text class="pn-name" x="' + d.x + '" y="' + (d.y - 4) + '" text-anchor="middle">' + esc(d.name) + "</text>";
      svg += '<text class="pn-ip" x="' + d.x + '" y="' + (d.y + 14) + '" text-anchor="middle">' + d.ip + "</text>";
    });
    svg += '<text x="390" y="318" text-anchor="middle" style="font:11px Segoe UI; fill:#6b7785;">Ethernet (durchgezogen) · WLAN (gestrichelt) · alles Demo-Daten</text>';
    svg += "</svg>";
    $("pilab-svg").innerHTML = svg;

    // Ping-Auswahl
    const srcSel = $("pi-src"), dstSel = $("pi-dst");
    PI_DEVICES.forEach(function (d) {
      [srcSel, dstSel].forEach(function (sel) {
        const opt = document.createElement("option");
        opt.value = d.id;
        opt.textContent = d.name + " (" + d.ip + ")";
        sel.appendChild(opt);
      });
    });
    srcSel.value = "pi4";
    dstSel.value = "pi86";

    $("pi-ping").addEventListener("click", function () {
      const src = PI_DEVICES.find(function (d) { return d.id === srcSel.value; });
      const dst = PI_DEVICES.find(function (d) { return d.id === dstSel.value; });
      const viaRepeater = usesRepeater(src.id, dst.id);
      const wired = !usesWifiPath(src.id, dst.id);

      piPrint("> ping " + dst.ip + " (von " + src.name + " " + src.ip + ")", "cmd");
      piPrint("PING " + dst.ip + " 56(84) bytes of data.");
      for (let seq = 1; seq <= 4; seq++) {
        (function (s) {
          window.setTimeout(function () {
            const base = wired ? 0.4 : 4;
            const jitter = wired ? Math.random() * 0.5 : 2 + Math.random() * 8;
            const extra = viaRepeater ? 1.5 : 0;
            piPrint("64 bytes from " + dst.ip + ": icmp_seq=" + s + " ttl=63 time=" + fmt(base + jitter + extra, 1) + " ms" +
              (viaRepeater ? "   (über Repeater)" : ""), "ok");
            if (s === 4) {
              piPrint("--- Statistik: 4 gesendet, 4 empfangen, 0 % Verlust" + (viaRepeater ? " · Weg: " + src.name + " → Router → Repeater → " + dst.name : " · Weg: " + src.name + " → Router → " + dst.name) + " (simuliert)", "dim");
            }
          }, s * 500);
        })(seq);
      }
    });

    // SSH-Ablauf
    const SSH_STEPS = [
      "DNS/ARP-Auflösung: pi-core.home → 192.168.0.4, MAC-Adresse im LAN erfragt",
      "TCP SYN: Laptop → Pi :22 (SSH-Port) – Verbindungsaufbau",
      "TCP SYN-ACK: Pi → Laptop – Port offen, Verbindung angenommen",
      "TCP ACK: Verbindung ESTABLISHED",
      "SSH-Handshake: Algorithmen aushandeln, Host-Key prüfen (bekannt_hosts), Session-Key via Diffie-Hellman",
      "Authentifizierung: Passwort oder Public-Key (authorized_keys)",
      "Shell: PTY geöffnet – du bist auf dem Pi (alle Schritte simuliert)"
    ];
    const sshBox = $("ssh-steps");
    SSH_STEPS.forEach(function (text, i) {
      const div = document.createElement("div");
      div.className = "ssh-step";
      div.id = "ssh-step-" + i;
      div.innerHTML = '<span class="n">' + (i + 1) + "</span><span>" + esc(text) + "</span>";
      sshBox.appendChild(div);
    });

    let sshTimer = null;
    $("ssh-run").addEventListener("click", function () {
      window.clearInterval(sshTimer);
      const steps = Array.prototype.slice.call(sshBox.children);
      steps.forEach(function (s) { s.classList.remove("active", "done"); });
      let i = 0;
      sshTimer = window.setInterval(function () {
        if (i > 0) steps[i - 1].classList.add("done");
        if (i >= steps.length) { window.clearInterval(sshTimer); return; }
        steps[i].classList.add("active");
        i++;
      }, 750);
    });

    // WLAN vs Ethernet
    $("wlan-eth-table").innerHTML =
      "<thead><tr><th>Eigenschaft</th><th>Ethernet (Kabel)</th><th>WLAN (über Repeater)</th></tr></thead><tbody>" +
      "<tr><td class='hl'>Latenz</td><td>0,3 – 1 ms</td><td>3 – 15 ms (Repeater +)</td></tr>" +
      "<tr><td class='hl'>Jitter (Schwankung)</td><td>sehr gering</td><td>merkbar (Funk teilt sich die Luft)</td></tr>" +
      "<tr><td class='hl'>Realer Durchsatz</td><td>~940 Mbit/s (Gigabit)</td><td>100 – 600 Mbit/s (je nach Standard, geteilt)</td></tr>" +
      "<tr><td class='hl'>Halb-Duplex-Problem</td><td>nein (Vollduplex)</td><td>ja beim einfachen Repeater</td></tr>" +
      "<tr><td class='hl'>Störanfällig</td><td>kaum</td><td>ja (Kanäle, Mikrowelle, Nachbarn)</td></tr>" +
      "<tr><td class='hl'>Aufwand</td><td>Kabel legen</td><td>flexibel, ohne Kabel</td></tr>" +
      "</tbody>";

    // Typische Fehler
    $("pi-errors").innerHTML =
      card("fa-network-wired", "Falsches Subnetz", "192.168.1.x statt 192.168.0.x", "Pi hat manuell 192.168.1.4 bekommen, Heimnetz ist 192.168.0.x → kein Ping. Check: <code>ip addr</code> + Gateway-Vergleich.") +
      card("fa-clone", "Doppelte IP", "Zwei Geräte mit 192.168.0.4", "Verbindungen brechen zufällig. Check: <code>arp</code> zeigt wechselnde MACs für eine IP → DHCP statt fester IPs nutzen.") +
      card("fa-wifi", "WLAN-Client-Isolation", "Pi über WLAN nicht erreichbar", "Manche APs trennen WLAN-Clients voneinander (Isolation aktiv). Test: Ping vom LAN-Gerät → klappt, WLAN→WLAN nicht.") +
      card("fa-arrows-left-right", "Repeater-Halbduplex", "Lange Ladezeiten hinter Repeater", "Repeater hört+sendet auf derselben Karte → ~50 % Durchsatz. Besser: AP per Kabel (Powerline/LAN) anbinden.") +
      card("fa-inbox", "DHCP-Pool leer", "Neue Geräte bekommen keine IP", "Zu viele Geräte / kurze Lease. Check: Router-Übersicht, Pool vergrößern oder statische Reservierungen.");

    piPrint("Pi-Netzwerklabor bereit – Demo-Netz 192.168.0.0/24 (rein simuliert). Ping auswählen und starten!", "dim");
  }

  function usesWifiPath(aId, bId) {
    const dev = function (id) { return PI_DEVICES.find(function (d) { return d.id === id; }); };
    return dev(aId).wifi || dev(bId).wifi;
  }

  function usesRepeater(aId, bId) {
    return (aId === "pi86" || bId === "pi86") && aId !== bId;
  }

  function piPrint(text, cls) {
    const out = $("pi-out");
    const div = document.createElement("div");
    if (cls) div.className = cls;
    div.textContent = text;
    out.appendChild(div);
    out.scrollTop = out.scrollHeight;
  }

  /* ---------- Start ---------- */
  initGrundlagen();
  simInit();
  initSubnet();
  pkInit();
  initTerminal();
  initTopologien();
  initWlan();
  initQuiz();
  initPiLab();
})();
