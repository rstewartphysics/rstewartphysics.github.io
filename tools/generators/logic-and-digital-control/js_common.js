    /* ---- shared: copied from the July Logic page (match widget, collapse, scrollspy, print) ---- */
    /* Match widgets */
    [].forEach.call(document.querySelectorAll("[data-match]"), function(w){
      var rows=[].slice.call(w.querySelectorAll("select[data-answer]"));
      var out=w.querySelector("[data-out]");
      function markOf(s){ return s.parentNode.querySelector(".match-mark"); }
      w.querySelector("[data-check]").addEventListener("click", function(){
        var done=0, right=0;
        rows.forEach(function(s){
          var m=markOf(s);
          if(!s.value){ m.textContent=""; m.className="match-mark"; return; }
          done++;
          var ok=(s.value===s.dataset.answer);
          if(ok) right++;
          m.textContent= ok?"✓":"✗";
          m.className="match-mark "+(ok?"ok":"no");
        });
        out.textContent = done===0 ? "Choose at least one answer first."
          : right+" of "+rows.length+" correct"+(right<rows.length ? " — fix the ✗ rows and check again." : " — well done!");
        w.dataset.result = done===0 ? "none" : (right<rows.length ? "partial" : "correct");
      });
      w.querySelector("[data-clear]").addEventListener("click", function(){
        rows.forEach(function(s){ s.value=""; var m=markOf(s); m.textContent=""; m.className="match-mark"; });
        out.textContent="";
      });
    });
    /* Diagram builders (tap-to-place tiles) */
    [].forEach.call(document.querySelectorAll("[data-builder]"), function(w){
      var slots=[].slice.call(w.querySelectorAll(".slot"));
      var tiles=[].slice.call(w.querySelectorAll(".tile"));
      var out=w.querySelector("[data-out]");
      function word(s){ return s.querySelector(".slot-word"); }
      function mark(s){ return s.querySelector(".slot-mark"); }
      function isEmpty(s){ return word(s).textContent==="—"; }
      function setLabel(s){
        var i=slots.indexOf(s)+1;
        s.setAttribute("aria-label", isEmpty(s) ? "Step "+i+" of "+slots.length+": empty"
          : "Step "+i+" of "+slots.length+": "+word(s).textContent+" — tap to remove");
      }
      function clearMarks(){
        slots.forEach(function(s){ s.classList.remove("ok","no"); mark(s).textContent=""; });
      }
      slots.forEach(setLabel);
      tiles.forEach(function(t){
        t.addEventListener("click", function(){
          if(t.disabled) return;
          for(var i=0;i<slots.length;i++){
            if(isEmpty(slots[i])){
              word(slots[i]).textContent=t.textContent;
              slots[i].classList.add("filled");
              t.disabled=true;
              clearMarks(); setLabel(slots[i]);
              out.textContent="Placed: "+t.textContent;
              return;
            }
          }
          out.textContent="All steps are full — tap a placed block to remove it first.";
        });
      });
      slots.forEach(function(s){
        s.addEventListener("click", function(){
          if(isEmpty(s)) return;
          var label=word(s).textContent;
          tiles.forEach(function(t){ if(t.textContent===label) t.disabled=false; });
          word(s).textContent="—";
          s.classList.remove("filled");
          clearMarks(); setLabel(s);
          out.textContent="Removed: "+label;
        });
      });
      w.querySelector("[data-check]").addEventListener("click", function(){
        if(slots.every(isEmpty)){ out.textContent="Place some blocks first."; w.dataset.result="none"; return; }
        var right=0;
        slots.forEach(function(s){
          var ok=(!isEmpty(s) && word(s).textContent===s.dataset.answer);
          if(ok) right++;
          s.classList.remove("ok","no");
          s.classList.add(ok?"ok":"no");
          mark(s).textContent= ok?"✓":"✗";
        });
        out.textContent= right===slots.length ? "All "+slots.length+" steps correct — well done!"
          : right+" of "+slots.length+" steps correct — the ✗ steps need a different block.";
        w.dataset.result = right===slots.length ? "correct" : "partial";
      });
      w.querySelector("[data-clear]").addEventListener("click", function(){
        slots.forEach(function(s){ word(s).textContent="—"; s.classList.remove("filled"); setLabel(s); });
        tiles.forEach(function(t){ t.disabled=false; });
        clearMarks();
        out.textContent="";
      });
    });

    /* Collapsible learn sections */
    (function(){
      var secs=[].slice.call(document.querySelectorAll("section.sec"));
      secs.forEach(function(sec){
        var h2=sec.querySelector("h2"); if(!h2) return;
        var tag=sec.querySelector(".concept-tag");
        var title=((h2.childNodes[0] && h2.childNodes[0].textContent) || "section").trim();
        var head=document.createElement("div"); head.className="sec-head";
        var body=document.createElement("div"); body.className="sec-body";
        while(sec.firstChild){ body.appendChild(sec.firstChild); }
        if(tag) head.appendChild(tag);
        head.appendChild(h2);
        var btn=document.createElement("button");
        btn.type="button"; btn.className="sec-toggle";
        btn.innerHTML='<span class="sec-chev" aria-hidden="true">▾</span>';
        head.appendChild(btn);
        sec.appendChild(head); sec.appendChild(body);
        function setOpen(open){
          sec.classList.toggle("collapsed", !open);
          btn.setAttribute("aria-expanded", open?"true":"false");
          btn.setAttribute("aria-label", (open?"Collapse ":"Expand ")+title);
        }
        setOpen(true);
        btn.addEventListener("click", function(e){ e.stopPropagation(); setOpen(sec.classList.contains("collapsed")); });
        head.addEventListener("click", function(e){ if(e.target!==btn && !btn.contains(e.target)) setOpen(sec.classList.contains("collapsed")); });
        sec._setOpen=setOpen;
      });
      function openTarget(hash){
        if(!hash || hash.charAt(0)!=="#" || hash.length<2) return;
        var el; try{ el=document.querySelector(hash); }catch(e){ return; }
        while(el){ if(el.classList && el.classList.contains("sec") && el._setOpen){ el._setOpen(true); break; } el=el.parentNode; }
      }
      [].forEach.call(document.querySelectorAll('a[href^="#"]'), function(a){
        a.addEventListener("click", function(){ openTarget(a.getAttribute("href")); });
      });
      window.addEventListener("hashchange", function(){ openTarget(location.hash); });
      if(location.hash) openTarget(location.hash);
      var ea=$("expand-all"), ca=$("collapse-all");
      if(ea) ea.addEventListener("click", function(){ secs.forEach(function(s){ s._setOpen&&s._setOpen(true); }); });
      if(ca) ca.addEventListener("click", function(){ secs.forEach(function(s){ s._setOpen&&s._setOpen(false); }); });
    })();

    /* Subnav scrollspy */
    (function(){
      if(!("IntersectionObserver" in window)) return;
      var links=document.querySelectorAll(".subnav-link"), map={};
      [].forEach.call(links, function(l){ map[l.getAttribute("href").slice(1)]=l; });
      var obs=new IntersectionObserver(function(entries){
        entries.forEach(function(en){
          if(!en.isIntersecting) return;
          [].forEach.call(links, function(l){ l.classList.remove("is-active"); l.removeAttribute("aria-current"); });
          var l=map[en.target.id];
          if(l){ l.classList.add("is-active"); l.setAttribute("aria-current","true"); }
        });
      }, { rootMargin: "-25% 0px -65% 0px" });
      Object.keys(map).forEach(function(id){ var s=document.getElementById(id); if(s) obs.observe(s); });
    })();

    /* Printing: open every answer reveal, then restore */
    (function(){
      var opened=[];
      window.addEventListener("beforeprint", function(){
        opened=[];
        [].forEach.call(document.querySelectorAll("details.reveal:not([open])"), function(d){ d.setAttribute("open",""); opened.push(d); });
      });
      window.addEventListener("afterprint", function(){
        opened.forEach(function(d){ d.removeAttribute("open"); });
        opened=[];
      });
    })();
    /* Report each match / builder widget to the progress engine after its own check has run */
    [].forEach.call(document.querySelectorAll("[data-match][data-prog-challenge], [data-builder][data-prog-challenge]"), function(w){
      var btn=w.querySelector("[data-check]"); if(!btn) return;
      btn.addEventListener("click", function(){
        var r=w.dataset.result; if(!r || r==="none") return;
        award(w.getAttribute("data-prog-challenge"), r==="correct");
      });
    });
