/* ОКЛ UI v3 · script.js */
(function(){
'use strict';

/* ═══════════════════════════════════════════════════════════════
   АІ-НАЛАШТУВАННЯ  |  Встановіть один із ключів перед script.js:

   ВАРІАНТ 1 — Google Gemini (безкоштовно, отримати на aistudio.google.com):
     window.OKL_GEMINI_KEY = 'AIza...';

   ВАРІАНТ 2 — OpenAI / ChatGPT (platform.openai.com):
     window.OKL_OPENAI_KEY = 'sk-...';

   ВАРІАНТ 3 — Claude / Anthropic через серверний proxy (console.anthropic.com):
     Встановити env ANTHROPIC_API_KEY на сервері — proxy вже є у файлах
     ai-consultant-proxy.php  та  api/ai-consultant.js

   Якщо жоден ключ не заданий — бот відповідає за локальними правилами.
   ═══════════════════════════════════════════════════════════════ */

var SYSTEM_PROMPT_LOCAL = "Ти Анна — медичний помічник КНП ХОР «Обласна клінічна лікарня» (ОКЛ) у Харкові, Україна.\n\nСУВОРІ ПРАВИЛА — НІКОЛИ НЕ ПОРУШУЙ:\n1. Ніколи не ставиш діагнозів і не вживаєш формулювань «у вас [хвороба]».\n2. Ніколи не призначаєш ліки, дозування або схеми лікування.\n3. При загрозливих симптомах (серцевий напад, інсульт, утруднене дихання, тяжка травма, втрата свідомості) — НЕГАЙНО рекомендуй телефонувати 103 або 112.\n\nЩО РОБИШ:\n- Визначаєш, до якого спеціаліста звернутися за симптомами пацієнта.\n- Надаєш інформацію про відділення та фахівців лікарні.\n- Розповідаєш як записатися на прийом.\n- Відповідаєш на питання про роботу лікарні, контакти, адресу, графік.\n- Відповідаєш на привітання та загальні питання ввічливо.\n\nВІДДІЛЕННЯ ЛІКАРНІ: Кардіологія, Неврологія (2 відділення), Офтальмологія, Ортопедія та травматологія, Ендокринологія, Ревматологія, Пульмонологія/Алергологія, Гастроентерологія, Нейрохірургія (2 відд.), Серцево-судинна хірургія, Загальна хірургія, Дерматовенерологія (2 відд.), Стоматологія (4 відд.), Гінекологія, Акушерство, Реабілітація, Гематологія, Нефрологія, Психіатрія.\n\nДІАГНОСТИКА: Клінічна лабораторія, УЗД та ехокардіографія, Рентген/КТ, Функціональна діагностика, Ендоскопія.\n\nКОНТАКТИ ОКЛ:\n- Реєстратура поліклініки: 057 705-66-91, 057 704-72-75\n- Мобільні: 093-972-75-02, 093-971-41-13\n- Довідкова: 057 705-67-22, 057 704-70-79\n- Жіноча консультація: 057 704-72-21\n- Онлайн-запис: h24.ua/organizacia/7856-knp-hor-okl\n- Адреса: м. Харків, пр. Незалежності, 13 (вхід з вул. Літературної, метро «Університет»)\n- Стаціонар: цілодобово 24/7 | Поліклініка: пн–пт 08:00–15:42\n\nВідповідай мовою співрозмовника (якщо пишуть українською — відповідай українською, якщо російською — російською). Будь теплою, лаконічною та корисною. Наприкінці кожної медичної відповіді рекомендуй особисто звернутися до лікаря.";


function ready(fn){
  if(document.readyState==='loading'){document.addEventListener('DOMContentLoaded',fn);}else{fn();}
}

ready(function(){

  /* ══ HEADER SCROLL ══════════════════════════════════ */
  var hdr = document.getElementById('siteHeader');
  if(hdr){
    window.addEventListener('scroll',function(){
      hdr.classList.toggle('scrolled', window.scrollY > 40);
    },{passive:true});
  }

  /* ══ SCROLL TOP ═════════════════════════════════════ */
  var stBtn = document.getElementById('scroll-top');
  if(stBtn){
    window.addEventListener('scroll',function(){
      stBtn.classList.toggle('is-visible', window.scrollY > 360);
    },{passive:true});
    stBtn.addEventListener('click',function(){
      window.scrollTo({top:0,behavior:'smooth'});
    });
  }

  /* ══ TOP NAV ACTIVE STATE ═══════════════════════════ */
  var current = (window.location.pathname.split('/').pop()||'index.html').toLowerCase();
  document.querySelectorAll('.topNav a').forEach(function(a){
    var href = (a.getAttribute('href')||'').toLowerCase();
    a.classList.toggle('is-active', href === current || (current==='' && href==='index.html'));
  });

  /* ══ NAV DRAWER ═════════════════════════════════════ */
  var navBtn     = document.getElementById('navBtn');
  var navDrawer  = document.getElementById('navDrawer');
  var navOverlay = document.getElementById('navOverlay');
  var navClose   = document.getElementById('navClose');
  var navSearch  = document.getElementById('navSearch');
  var navList    = document.getElementById('navList');
  var navQuick   = document.getElementById('navQuick');

  var MENU = {
    quick:[
      {label:'Записатися',href:'https://h24.ua/organizacia/7856-knp-hor-okl',type:'chip'},
      {label:'Новини',href:'news.html',type:'chip'},
      {label:'Підрозділи',href:'departments.html',type:'chip'},
      {label:'Лікарі',href:'doctors.html',type:'chip'},
      {label:'Контакти',href:'contacts.html',type:'chip--ghost'}
    ],
    items:[
      {type:'group',id:'about',label:'Про лікарню',children:[
        {label:'Адміністрація',href:'about.html#administration'},
        {label:'Ми сьогодні',href:'about.html#today'},
        {label:'Історія лікарні',href:'about.html#history'},
        {label:'Наші лікарі',href:'doctors.html'},
        {label:'Ліцензії та сертифікати',href:'licenses.html'},
        {label:'Вакансії',href:'vacancies.html'}
      ]},
      {type:'group',id:'depts',label:'Наші підрозділи',children:[
        {label:'Поліклінічна служба',href:'departments.html#departments'},
        {label:'Діагностичні відділення',href:'departments.html#departments'},
        {label:'Хірургічні відділення',href:'departments.html#departments'},
        {label:'Терапевтичні відділення',href:'departments.html#departments'},
        {label:'Перинатальний профіль',href:'departments.html#departments'}
      ]},
      {type:'group',id:'patients',label:'Для пацієнтів',children:[
        {label:"Права та обов'язки",href:'patients.html#rights'},
        {label:'Порядок відвідування',href:'patients.html#visits'},
        {label:'Госпіталізація',href:'patients.html#hospitalization'},
        {label:'Платні послуги',href:'patients.html#paid'},
        {label:'Прийом громадян',href:'patients.html#citizens'}
      ]},
      {type:'group',id:'public',label:'Публічна інформація',children:[
        {label:'Закупівлі',href:'public.html#procurement'},
        {label:'Благодійні пожертви',href:'public.html#donations'},
        {label:'Медичні препарати',href:'public.html#meds'}
      ]},
      {type:'link',label:'Новини',href:'news.html'},
      {type:'link',label:'Головна',href:'index.html'},
      {type:'link',label:'Контакти',href:'contacts.html'}
    ]
  };

  /* ══ НОВИНИ — WordPress REST API ═══════════════════ */
  var WP_API = ‘https://rch.kh.gov.ua/wp-json/wp/v2/posts’;

  var UA_MONTHS = [‘січня’,’лютого’,’березня’,’квітня’,’травня’,’червня’,
                   ‘липня’,’серпня’,’вересня’,’жовтня’,’листопада’,’грудня’];

  function formatDate(iso){
    var d = new Date(iso);
    return d.getDate()+’ ‘+UA_MONTHS[d.getMonth()]+’ ‘+d.getFullYear();
  }

  function stripHtml(html){
    var tmp = document.createElement(‘div’);
    tmp.innerHTML = html||’’;
    return (tmp.textContent||tmp.innerText||’’).trim();
  }

  /* Витягує PDF-посилання з HTML контенту */
  function extractPdfs(html){
    var pdfs = [];
    var re = /href=["’](https?:\/\/[^"’]+\.pdf[^"’]*)/gi;
    var m;
    while((m = re.exec(html)) !== null){
      var url = m[1];
      /* уникаємо дублікатів */
      if(pdfs.indexOf(url) === -1) pdfs.push(url);
    }
    return pdfs;
  }

  /* Ім’я файлу з URL */
  function pdfName(url){
    try {
      var name = decodeURIComponent(url.split(‘/’).pop().split(‘?’)[0]);
      return name.replace(/\.pdf$/i,’’);
    } catch(e){ return ‘Документ’; }
  }

  /* Визначає тег запису */
  function postTag(p){
    var cats = (p._embedded&&p._embedded[‘wp:term’]&&p._embedded[‘wp:term’][0])||[];
    var catName = cats[0]&&cats[0].name&&cats[0].name!==’Uncategorized’ ? cats[0].name : ‘’;
    if(catName) return catName;
    var title = stripHtml(p.title&&p.title.rendered||’’).toLowerCase();
    if(/наказ/.test(title))        return ‘Наказ’;
    if(/розпорядж/.test(title))    return ‘Розпорядження’;
    if(/оголош/.test(title))       return ‘Оголошення’;
    if(/тендер|закупів/.test(title)) return ‘Закупівлі’;
    if(/вакансі/.test(title))      return ‘Вакансії’;
    return ‘Новини’;
  }

  /* Короткий текст для картки */
  function postExcerpt(p){
    var exc = stripHtml(p.excerpt&&p.excerpt.rendered||’’);
    if(exc) return exc.length>160 ? exc.slice(0,160)+’…’ : exc;
    var cnt = stripHtml(p.content&&p.content.rendered||’’)
                .replace(/Завантажити/gi,’’).trim();
    if(cnt) return cnt.length>160 ? cnt.slice(0,160)+’…’ : cnt;
    /* якщо є PDF — показуємо назву */
    var pdfs = extractPdfs(p.content&&p.content.rendered||’’);
    if(pdfs.length) return ‘📄 ‘+pdfName(pdfs[0]);
    return ‘’;
  }

  /* ── Картка (grid та list) ───────────────────────── */
  function newsCardHtml(p, mode){
    var title   = stripHtml(p.title&&p.title.rendered||’’);
    var excerpt = postExcerpt(p);
    var date    = formatDate(p.date);
    var tag     = postTag(p);
    var img     = p._embedded&&p._embedded[‘wp:featuredmedia’]&&
                  p._embedded[‘wp:featuredmedia’][0]&&
                  p._embedded[‘wp:featuredmedia’][0].source_url||’’;
    var pdfs    = extractPdfs(p.content&&p.content.rendered||’’);
    var isPdf   = !excerpt && pdfs.length;

    /* іконка типу */
    var tagIcon = {
      ‘Наказ’:’📋’,’Розпорядження’:’📋’,’Оголошення’:’📢’,
      ‘Закупівлі’:’📦’,’Вакансії’:’👤’
    }[tag]||’📰’;

    var cls = mode===’list’ ? ‘nCard nCard--list reveal’ : ‘nCard reveal’;
    var hTag = mode===’list’ ? ‘h2’ : ‘h3’;

    var inner =
      (img ? ‘<div class="nCard__img"><img src="’+img+’" alt="’+title+’" loading="lazy"></div>’ : ‘’)+
      ‘<div class="nCard__body">’+
        ‘<div class="nCard__meta">’+
          ‘<span class="nCard__tag">’+tagIcon+’ ‘+tag+’</span>’+
          ‘<span class="nCard__date">’+date+’</span>’+
        ‘</div>’+
        ‘<’+hTag+’ class="nCard__title">’+title+’</’+hTag+’>’;

    if(isPdf){
      /* Для PDF-постів — кнопки завантаження прямо на картці */
      inner += ‘<div class="nCard__pdfs">’;
      pdfs.slice(0,2).forEach(function(url){
        inner += ‘<a class="nCard__pdfBtn" href="’+url+’" target="_blank" rel="noopener" onclick="event.stopPropagation()">’+
          ‘<svg viewBox="0 0 24 24" width="14" height="14" fill="currentColor"><path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8l-6-6zm-1 1.5L18.5 9H13V3.5zM12 17l-4-4h2.5v-3h3v3H16l-4 4z"/></svg>’+
          pdfName(url)+
        ‘</a>’;
      });
      if(pdfs.length>2) inner += ‘<span class="nCard__pdfMore">+ще ‘+(pdfs.length-2)+’ файли</span>’;
      inner += ‘</div>’;
    } else if(excerpt){
      inner += ‘<p class="nCard__excerpt">’+excerpt+’</p>’;
    }

    inner += ‘<span class="nCard__cta">Докладніше →</span>’;
    inner += ‘</div></article>’;  /* закриємо нижче */

    return ‘<article class="’+cls+’" onclick="location.href=\’news.html?id=’+p.id+’\’" tabindex="0" role="button" aria-label="’+title+’">’+inner;
  }

  function revealCards(container){
    if(‘IntersectionObserver’ in window){
      var obs = new IntersectionObserver(function(entries){
        entries.forEach(function(e){
          if(e.isIntersecting){e.target.classList.add(‘isIn’);obs.unobserve(e.target);}
        });
      },{threshold:0.06});
      container.querySelectorAll(‘.reveal’).forEach(function(el){obs.observe(el);});
    } else {
      container.querySelectorAll(‘.reveal’).forEach(function(el){el.classList.add(‘isIn’);});
    }
  }

  function skeletonHtml(n, wide){
    var cls = wide ? ‘nCard nCard--list nCard--skel’ : ‘nCard nCard--skel’;
    return Array(n).fill(
      ‘<div class="’+cls+’">’+
        ‘<div class="nCard__body">’+
          ‘<div class="skel-line" style="width:30%;height:12px;margin-bottom:14px"></div>’+
          ‘<div class="skel-line" style="width:85%;height:20px;margin-bottom:10px"></div>’+
          ‘<div class="skel-line" style="width:65%;height:14px"></div>’+
        ‘</div>’+
      ‘</div>’
    ).join(‘’);
  }

  /* ── Головна: 3 новини ───────────────────────────── */
  var newsGrid = document.getElementById(‘news-grid’);
  if(newsGrid){
    newsGrid.innerHTML = skeletonHtml(3, false);
    fetch(WP_API+’?per_page=3&_embed&orderby=date&order=desc’)
      .then(function(r){return r.json();})
      .then(function(posts){
        newsGrid.innerHTML = posts.map(function(p){return newsCardHtml(p,’grid’);}).join(‘’);
        revealCards(newsGrid);
      })
      .catch(function(){
        newsGrid.innerHTML = ‘<p class="muted">Не вдалося завантажити новини.</p>’;
      });
  }

  /* ── Сторінка новин ──────────────────────────────── */
  var newsListEl  = document.getElementById(‘news-list’);
  var newsArticle = document.getElementById(‘news-article’);

  if(newsListEl){
    var params  = new URLSearchParams(window.location.search);
    var openId  = parseInt(params.get(‘id’),10)||0;
    var newsPage= parseInt(params.get(‘page’),10)||1;

    if(openId && newsArticle){
      /* ── Стаття ──── */
      newsListEl.style.display = ‘none’;
      newsArticle.style.display= ‘block’;
      newsArticle.innerHTML = skeletonHtml(1, true);

      fetch(WP_API+’/’+openId+’?_embed’)
        .then(function(r){return r.json();})
        .then(function(p){
          var title   = stripHtml(p.title&&p.title.rendered||’’);
          var date    = formatDate(p.date);
          var tag     = postTag(p);
          var tagIcon = {‘Наказ’:’📋’,’Розпорядження’:’📋’,’Оголошення’:’📢’,’Закупівлі’:’📦’,’Вакансії’:’👤’}[tag]||’📰’;
          var img     = p._embedded&&p._embedded[‘wp:featuredmedia’]&&
                        p._embedded[‘wp:featuredmedia’][0]&&
                        p._embedded[‘wp:featuredmedia’][0].source_url||’’;
          var pdfs    = extractPdfs(p.content&&p.content.rendered||’’);
          var contentHtml = p.content&&p.content.rendered||’’;
          /* якщо контент — лише wp-block-file (тільки PDF без тексту) прибираємо блок */
          var textOnly = stripHtml(contentHtml).replace(/Завантажити/gi,’’).trim();

          /* breadcrumb */
          var bc = document.getElementById(‘breadcrumbs’);
          if(bc) bc.innerHTML=’<a href="index.html">Головна</a> / <a href="news.html">Новини</a> / ‘+title;
          var pt = document.getElementById(‘page-title’);
          if(pt) pt.textContent = title;
          var pl = document.getElementById(‘page-lead’);
          if(pl) pl.textContent = date;

          var html =
            ‘<a class="btn btn--ghost btn--sm" href="news.html" style="margin-bottom:28px;display:inline-flex;gap:6px">← Усі новини</a>’+
            ‘<div class="nArticle">’+
              ‘<div class="nArticle__meta">’+
                ‘<span class="nCard__tag">’+tagIcon+’ ‘+tag+’</span>’+
                ‘<span class="nCard__date">’+date+’</span>’+
              ‘</div>’+
              ‘<h1 class="nArticle__title">’+title+’</h1>’+
              (img?’<img class="nArticle__hero" src="’+img+’" alt="’+title+’">’:’’)+
              (textOnly && pdfs.length===0 ?
                ‘<div class="nArticle__body">’+contentHtml+’</div>’ : ‘’)+
              (pdfs.length ?
                ‘<div class="nArticle__docs">’+
                  ‘<div class="nArticle__docsTitle">’+
                    ‘<svg viewBox="0 0 24 24" width="18" height="18" fill="currentColor"><path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8l-6-6zm-1 1.5L18.5 9H13V3.5z"/></svg>’+
                    ‘Документи’+
                  ‘</div>’+
                  pdfs.map(function(url){
                    return ‘<a class="nArticle__docRow" href="’+url+’" target="_blank" rel="noopener">’+
                      ‘<span class="nArticle__docIcon">PDF</span>’+
                      ‘<span class="nArticle__docName">’+pdfName(url)+’</span>’+
                      ‘<span class="nArticle__docDl">Завантажити ↓</span>’+
                    ‘</a>’;
                  }).join(‘’)+
                ‘</div>’ : ‘’)+
            ‘</div>’+
            ‘<div style="margin-top:32px;display:flex;gap:12px;flex-wrap:wrap">’+
              ‘<a class="btn btn--outline" href="news.html">← Повернутись</a>’+
              ‘<a class="btn btn--ghost btn--sm" href="’+p.link+’" target="_blank" rel="noopener">Оригінал на rch.kh.gov.ua ↗</a>’+
            ‘</div>’;

          newsArticle.innerHTML = html;
        })
        .catch(function(){
          newsArticle.innerHTML=’<p>Не вдалося завантажити. <a href="news.html">← Повернутись</a></p>’;
        });

    } else {
      /* ── Список ──── */
      var perPage = 12;
      newsListEl.innerHTML = skeletonHtml(6, true);
      fetch(WP_API+’?per_page=’+perPage+’&page=’+newsPage+’&_embed&orderby=date&order=desc’)
        .then(function(r){
          var totalPages = parseInt(r.headers.get(‘X-WP-TotalPages’)||’1’,10);
          var total      = parseInt(r.headers.get(‘X-WP-Total’)||’0’,10);
          return r.json().then(function(posts){return {posts:posts,pages:totalPages,total:total};});
        })
        .then(function(data){
          newsListEl.innerHTML = data.posts.map(function(p){return newsCardHtml(p,’list’);}).join(‘’);
          revealCards(newsListEl);
          /* Пагінація + лічильник */
          var pag = ‘<div class="newsPager">’+
            ‘<span class="newsPager__count">Всього: ‘+data.total+’ записів</span>’+
            ‘<div class="newsPager__btns">’;
          if(newsPage>1) pag+=’<a href="news.html?page=’+(newsPage-1)+’" class="btn btn--ghost btn--sm">← Назад</a>’;
          for(var pg=Math.max(1,newsPage-2);pg<=Math.min(data.pages,newsPage+2);pg++){
            pag+=’<a href="news.html?page=’+pg+’" class="btn btn--sm ‘+(pg===newsPage?’btn--primary’:’btn--ghost’)+’">’+pg+’</a>’;
          }
          if(newsPage<data.pages) pag+=’<a href="news.html?page=’+(newsPage+1)+’" class="btn btn--ghost btn--sm">Далі →</a>’;
          pag+=’</div></div>’;
          if(data.pages>1) newsListEl.insertAdjacentHTML(‘beforeend’, pag);
        })
        .catch(function(){
          newsListEl.innerHTML=’<p class="muted">Не вдалося завантажити новини.</p>’;
        });
    }
  }

  if(navBtn && navDrawer && navOverlay && navClose && navList){
    /* render quick chips */
    if(navQuick){
      navQuick.innerHTML = MENU.quick.map(function(q){
        return '<a class="chip '+(q.type||'')+'" href="'+q.href+'">'+q.label+'</a>';
      }).join('');
    }

    /* render nav items */
    var html='';
    MENU.items.forEach(function(item){
      if(item.type==='link'){
        html+='<a class="navLink" href="'+item.href+'">'+item.label+'</a>';
      } else {
        var ch = item.children.map(function(c){
          return '<a href="'+c.href+'">'+c.label+'</a>';
        }).join('');
        html+='<button class="navGroup" data-acc="'+item.id+'"><span>'+item.label+'</span><span class="chev">▾</span></button>';
        html+='<div class="navSub" id="nav-sub-'+item.id+'" style="height:0"><div class="navSub__inner">'+ch+'</div></div>';
      }
    });
    navList.innerHTML = html;

    /* accordion */
    navList.addEventListener('click',function(e){
      var g = e.target.closest('.navGroup');
      if(!g) return;
      var key = g.getAttribute('data-acc');
      var panel = document.getElementById('nav-sub-'+key);
      if(!panel) return;
      var willOpen = !g.classList.contains('isOpen');
      /* close others */
      navList.querySelectorAll('.navGroup.isOpen').forEach(function(og){
        if(og===g) return;
        og.classList.remove('isOpen');
        var op = document.getElementById('nav-sub-'+og.getAttribute('data-acc'));
        if(op) op.style.height='0';
      });
      g.classList.toggle('isOpen',willOpen);
      if(willOpen){
        var inner = panel.querySelector('.navSub__inner');
        panel.style.height = (inner?inner.scrollHeight:0)+'px';
      } else {
        panel.style.height='0';
      }
    });

    /* search filter */
    if(navSearch){
      navSearch.addEventListener('input',function(){
        var q = navSearch.value.trim().toLowerCase();
        if(!q){
          navList.querySelectorAll('a,.navGroup').forEach(function(el){el.style.display='';});
          return;
        }
        navList.querySelectorAll('.navLink').forEach(function(a){
          a.style.display = a.textContent.toLowerCase().includes(q)?'':'none';
        });
        navList.querySelectorAll('.navGroup').forEach(function(g){
          var key = g.getAttribute('data-acc');
          var panel = document.getElementById('nav-sub-'+key);
          var links = panel?panel.querySelectorAll('a'):[];
          var any = false;
          links.forEach(function(l){
            var ok = l.textContent.toLowerCase().includes(q);
            l.style.display = ok?'':'none';
            if(ok) any=true;
          });
          g.style.display = any?'':'none';
          if(any && panel){
            g.classList.add('isOpen');
            var inner = panel.querySelector('.navSub__inner');
            panel.style.height=(inner?inner.scrollHeight:0)+'px';
          }
        });
      });
    }

    function openDrawer(){
      navDrawer.classList.add('isOpen');
      navOverlay.classList.add('visible');
      navBtn.setAttribute('aria-expanded','true');
      document.documentElement.style.overflow='hidden';
      setTimeout(function(){if(navSearch)navSearch.focus();},80);
    }
    function closeDrawer(){
      navDrawer.classList.remove('isOpen');
      navOverlay.classList.remove('visible');
      navBtn.setAttribute('aria-expanded','false');
      document.documentElement.style.overflow='';
    }
    navBtn.addEventListener('click',openDrawer);
    navClose.addEventListener('click',closeDrawer);
    navOverlay.addEventListener('click',closeDrawer);
    window.addEventListener('keydown',function(e){if(e.key==='Escape'){closeDrawer();closeSearch();}});
  }

  /* ══ SITE SEARCH ════════════════════════════════════ */
  var searchBtn    = document.getElementById('searchBtn');
  var siteSearch   = document.getElementById('siteSearch');
  var searchClose  = document.getElementById('searchClose');
  var searchInput  = document.getElementById('siteSearchInput');
  var searchMeta   = document.getElementById('siteSearchMeta');
  var searchResults= document.getElementById('siteSearchResults');
  var searchOverlay= document.getElementById('searchOverlay');

  var SEARCH_DB = [
    /* pages */
    {t:'Головна',d:'Головна сторінка лікарні',h:'index.html'},
    {t:'Про лікарню',d:'Про лікарню, адміністрація, історія',h:'about.html'},
    {t:'Адміністрація',d:'Керівництво та адміністрація лікарні',h:'about.html#administration'},
    {t:'Всі лікарі',d:'Каталог лікарів з фільтром за відділенням',h:'doctors.html'},
    {t:'Наші фахівці',d:'Спеціалісти лікарні',h:'specialists.html'},
    {t:'Наші підрозділи',d:'Відділення та служби лікарні',h:'departments.html'},
    {t:'Для пацієнтів',d:'Права пацієнтів, госпіталізація, платні послуги',h:'patients.html'},
    {t:'Права пацієнтів',d:'Права та обовязки пацієнта',h:'patients.html#rights'},
    {t:'Госпіталізація',d:'Порядок госпіталізації до стаціонару',h:'patients.html#hospitalization'},
    {t:'Платні послуги',d:'Перелік платних медичних послуг',h:'patients.html#paid'},
    {t:'Публічна інформація',d:'Закупівлі, пожертви, медикаменти',h:'public.html'},
    {t:'Контакти',d:'Телефони, адреса, онлайн-запис',h:'contacts.html'},
    {t:'Ліцензії та сертифікати',d:'Ліцензії на медичну діяльність',h:'licenses.html'},
    {t:'Вакансії',d:'Відкриті вакансії для медичного персоналу',h:'vacancies.html'},
    /* doctors */
    {t:'Кушнірська Олена — психіатр',d:'Лікар-психіатр вищої категорії',h:'doctors.html'},
    {t:'Петренко Василь — кардіолог',d:'Кардіолог вищої категорії',h:'doctors.html'},
    {t:'Сидоренко Тетяна — невролог',d:'Невролог першої категорії',h:'doctors.html'},
    {t:'Бондаренко Ігор — хірург',d:'Хірург вищої категорії, к.м.н.',h:'doctors.html'},
    {t:'Мороз Ірина — гінеколог',d:'Акушер-гінеколог вищої категорії',h:'doctors.html'},
    {t:'Громова Юлія — ендокринолог',d:'Ендокринолог, цукровий діабет',h:'doctors.html'},
    {t:'Захаренко Людмила — офтальмолог',d:'Лікування глаукоми та катаракти',h:'doctors.html'},
    {t:'Кириленко Павло — нейрохірург',d:'Нейрохірург, д.м.н.',h:'doctors.html'},
    /* departments */
    {t:'Кардіологія',d:'Діагностика та лікування захворювань серця',h:'departments.html'},
    {t:'Неврологія',d:'Інсульт, мігрень, захворювання хребта',h:'departments.html'},
    {t:'Нейрохірургія',d:'Операції на мозку та хребті',h:'departments.html'},
    {t:'Гінекологія та акушерство',d:'Ведення вагітності, пологи',h:'departments.html'},
    {t:'Ендокринологія',d:'Цукровий діабет, щитоподібна залоза',h:'departments.html'},
    {t:'Офтальмологія',d:'Глаукома, катаракта, сітківка',h:'departments.html'},
    {t:'Ортопедія',d:'Ендопротезування, травми, артроскопія',h:'departments.html'},
    {t:'Хірургія',d:'Лапароскопічна та відкрита хірургія',h:'departments.html'},
    {t:'Реабілітація',d:'Фізіотерапія та відновлення',h:'departments.html'},
    {t:'Психіатрія',d:'Психіатрія та психотерапія',h:'departments.html'},
    {t:'Пульмонологія',d:'Бронхіальна астма, ХОЗЛ',h:'departments.html'},
    {t:'Гастроентерологія',d:'Захворювання ШКТ',h:'departments.html'},
    {t:'Клінічна лабораторія',d:'Аналізи та дослідження',h:'departments.html'},
    {t:'УЗД та ехокардіографія',d:'Ультразвукова діагностика',h:'departments.html'},
    {t:'Комп\'ютерна томографія',d:'КТ та рентгенологія',h:'departments.html'},
    /* contacts */
    {t:'Онлайн-запис h24.ua',d:'Запис на прийом через Інтернет',h:'https://h24.ua/organizacia/7856-knp-hor-okl'},
    {t:'Довідкова 057 705-67-22',d:'Телефон довідкової служби',h:'contacts.html'},
    {t:'Реєстратура 057 705-66-91',d:'Телефон реєстратури поліклініки',h:'contacts.html'}
  ];

  function openSearch(){
    if(!siteSearch) return;
    siteSearch.classList.add('is-open');
    document.documentElement.style.overflow='hidden';
    setTimeout(function(){if(searchInput)searchInput.focus();},40);
  }
  function closeSearch(){
    if(!siteSearch) return;
    siteSearch.classList.remove('is-open');
    document.documentElement.style.overflow='';
    if(searchInput) searchInput.value='';
    if(searchResults) searchResults.innerHTML='';
    if(searchMeta) searchMeta.textContent='Почніть вводити запит для пошуку';
  }

  if(searchBtn) searchBtn.addEventListener('click',openSearch);
  if(searchClose) searchClose.addEventListener('click',closeSearch);
  if(searchOverlay) searchOverlay.addEventListener('click',closeSearch);

  if(searchInput){
    searchInput.addEventListener('input',function(){
      var q = searchInput.value.trim().toLowerCase();
      if(!q){ if(searchMeta) searchMeta.textContent='Почніть вводити запит для пошуку'; if(searchResults) searchResults.innerHTML=''; return; }
      var res = SEARCH_DB.filter(function(it){ return (it.t+' '+it.d).toLowerCase().includes(q); }).slice(0,12);
      if(searchResults){
        searchResults.innerHTML = res.length
          ? res.map(function(it){ return '<a class="siteSearch__result" href="'+it.h+'"><h4>'+it.t+'</h4><p>'+it.d+'</p></a>'; }).join('')
          : '<p class="siteSearch__empty">Нічого не знайдено</p>';
      }
      if(searchMeta) searchMeta.textContent = res.length ? 'Знайдено: '+res.length : '';
    });
  }

  /* ══ DEPT FILTER (departments page) ════════════════ */
  document.querySelectorAll('.deptFilter__btn[data-dept-filter]').forEach(function(btn){
    btn.addEventListener('click',function(){
      var cat = this.getAttribute('data-dept-filter');
      document.querySelectorAll('.deptFilter__btn[data-dept-filter]').forEach(function(b){ b.classList.remove('is-active'); });
      this.classList.add('is-active');
      document.querySelectorAll('.serviceCard[data-dept-cat]').forEach(function(c){
        c.style.display = (cat==='all' || c.getAttribute('data-dept-cat')===cat)?'':'none';
      });
    });
  });

  /* ══ DOCTORS FILTER (doctors page) ═════════════════ */
  var doctorGrid = document.getElementById('doctorsGrid');
  var doctorEmpty = document.getElementById('doctorsEmpty');
  var doctorSearchInput = document.getElementById('doctorSearchInput');

  function filterDoctors(){
    if(!doctorGrid) return;
    var dept = (document.querySelector('.deptFilter__btn[data-dept].is-active')||{getAttribute:function(){return 'all';}}).getAttribute('data-dept');
    var q = doctorSearchInput ? doctorSearchInput.value.trim().toLowerCase() : '';
    var cards = doctorGrid.querySelectorAll('.doctorCard');
    var visible = 0;
    cards.forEach(function(c){
      var matchDept = dept==='all' || c.getAttribute('data-dept')===dept;
      var name = (c.getAttribute('data-name')||'').toLowerCase();
      var bodyText = c.textContent.toLowerCase();
      var matchQ = !q || name.includes(q) || bodyText.includes(q);
      var show = matchDept && matchQ;
      c.hidden = !show;
      if(show) visible++;
    });
    if(doctorEmpty) doctorEmpty.style.display = visible===0?'block':'none';
  }

  document.querySelectorAll('.deptFilter__btn[data-dept]').forEach(function(btn){
    btn.addEventListener('click',function(){
      document.querySelectorAll('.deptFilter__btn[data-dept]').forEach(function(b){ b.classList.remove('is-active'); });
      this.classList.add('is-active');
      filterDoctors();
    });
  });

  if(doctorSearchInput) doctorSearchInput.addEventListener('input', filterDoctors);

  /* ══ ACCORDION ══════════════════════════════════════ */
  document.querySelectorAll('.accordion__trigger').forEach(function(btn){
    btn.addEventListener('click',function(){
      var item = this.closest('.accordion__item');
      if(item) item.classList.toggle('is-open');
    });
  });

  /* ══ REVEAL ANIMATIONS ══════════════════════════════ */
  var reveals = document.querySelectorAll('.reveal');
  if(reveals.length && 'IntersectionObserver' in window){
    var io = new IntersectionObserver(function(entries){
      entries.forEach(function(e){ if(e.isIntersecting){ e.target.classList.add('isIn'); io.unobserve(e.target); } });
    },{threshold:0.12});
    reveals.forEach(function(el){ io.observe(el); });
  } else {
    reveals.forEach(function(el){ el.classList.add('isIn'); });
  }

  /* ══ AI CONSULTANT ══════════════════════════════════ */
  var aiPanel    = document.getElementById('ai-panel');
  var aiTrigger  = document.getElementById('ai-trigger');
  var aiOpenBtn  = document.getElementById('ai-open-btn');
  var aiCloseBtn = document.getElementById('ai-close-btn');
  var aiInput    = document.getElementById('ai-input');
  var aiSendBtn  = document.getElementById('ai-send-btn');
  var aiMsgs     = document.getElementById('ai-messages');
  var aiChipsEl  = document.getElementById('ai-chips');

  if(!aiPanel || !aiOpenBtn) return;

  var AI_OPEN = false;
  var AI_LOADING = false;
  var AI_HISTORY = [];

  function aiToggle(){
    AI_OPEN = !AI_OPEN;
    aiPanel.classList.toggle('open', AI_OPEN);
    var badge = aiTrigger ? aiTrigger.querySelector('.ai-badge') : null;
    if(badge) badge.style.display = AI_OPEN ? 'none' : '';
    if(AI_OPEN && aiInput) aiInput.focus();
  }

  function aiAddMsg(role, html){
    if(!aiMsgs) return;
    var d = document.createElement('div');
    d.className = 'msg '+role;
    var safe = String(html||'')
      .replace(/&/g,'&amp;').replace(/</g,'&lt;').replace(/>/g,'&gt;')
      .replace(/\*\*(.*?)\*\*/g,'<strong>$1</strong>').replace(/\n/g,'<br>');
    if(role==='bot'){
      d.innerHTML='<div class="msg-av">А</div><div class="bubble">'+safe+'</div>';
    } else {
      d.innerHTML='<div class="bubble">'+safe+'</div>';
    }
    aiMsgs.appendChild(d);
    aiMsgs.scrollTop = aiMsgs.scrollHeight;
  }

  function aiShowTyping(){
    if(!aiMsgs) return;
    var d=document.createElement('div');
    d.className='msg bot'; d.id='ai-typing';
    d.innerHTML='<div class="msg-av">А</div><div class="bubble"><div class="typing-dots"><span></span><span></span><span></span></div></div>';
    aiMsgs.appendChild(d); aiMsgs.scrollTop=aiMsgs.scrollHeight;
  }
  function aiHideTyping(){ var el=document.getElementById('ai-typing'); if(el) el.remove(); }

  /* ── LOCAL AI RULES ENGINE ──────────────────────────
     Повністю локальна логіка — не потребує сервера.
     Відповідає на: привітання, симптоми → фахівець,
     телефони / адресу / запис, графік роботи.
  ─────────────────────────────────────────────────── */
  var CONTACTS_TEXT = [
    'Ось контакти КНП ХОР «ОКЛ»:',
    '',
    '📞 **Довідкова:** 057 705-67-22, 057 704-70-79',
    '📞 **Реєстратура поліклініки:** 057 705-66-91, 057 704-72-75',
    '📱 **Мобільні:** 093-972-75-02, 093-971-41-13',
    '📞 **Жіноча консультація:** 057 704-72-21',
    '',
    '🌐 **Онлайн-запис:** h24.ua/organizacia/7856-knp-hor-okl',
    '',
    '📍 **Адреса:** м. Харків, пр. Незалежності, 13',
    '(вхід з вул. Літературної, метро «Університет»)',
    '',
    '🏥 **Стаціонар:** цілодобово (24/7)',
    '🏢 **Поліклініка:** пн–пт 08:00–15:42'
  ].join('\n');

  var RULES = [
    /* EMERGENCY — УКР + РУС */
    {
      kw: /серцев.*напад|інсульт|не дихає|задихаю|зупинка серця|непритомн|дуже сильний біль у груд|швидку|сердечн.*приступ|не дышит|потерял.*сознани|инсульт|остановка сердца|вызовите скорую/i,
      ans: '🚨 **Увага! Терміново телефонуйте 103** або 112!\n\nЦі симптоми потребують негайної медичної допомоги — не чекайте, викликайте швидку. Якщо є можливість — самостійно доїжджайте до приймального відділення (пр. Незалежності, 13, цілодобово).'
    },
    /* GREETINGS — УКР + РУС */
    {
      kw: /^(привіт|вітаю|добрий|доброго|добрий день|доброго дня|добрий ранок|доброго ранку|добрий вечір|доброго вечора|hello|hi|здравствуй|здрасте|хай|добрый день|добрый вечер|доброе утро|привет)\b/i,
      ans: 'Вітаю! Я Анна, медичний помічник Обласної клінічної лікарні Харкова.\n\nОпишіть ваші симптоми або запитання — підкажу, до якого **лікаря-спеціаліста** вам звернутися та як записатися. Я не ставлю діагнозів і не призначаю лікування.'
    },
    /* HOW ARE YOU — УКР + РУС */
    {
      kw: /як справи|як ти|як ви|що нового|як здоров|як себе почуваєш|как дела|как вы|как ты|как здоровье|что нового|как поживаешь/i,
      ans: 'Дякую, що запитали! Я Анна — медичний помічник ОКЛ, завжди готова допомогти.\n\nЯкщо у вас є питання про здоров\'я або потрібно записатися до лікаря — просто опишіть симптоми або запитайте. 😊'
    },
    /* WHO ARE YOU — УКР + РУС */
    {
      kw: /хто ти|що ти|ти хто|ти бот|ти робот|ти людина|як тебе звуть|хто такий|кто ты|что ты|ты бот|ты робот|как тебя зовут|кто такая/i,
      ans: 'Я Анна — віртуальний медичний помічник КНП ХОР «Обласна клінічна лікарня» Харкова.\n\nЯ допомагаю:\n🔹 Визначити, до якого **лікаря** звернутися\n🔹 Отримати **контакти** та графік роботи\n🔹 Дізнатися як **записатися** на прийом\n\nЯ **не ставлю діагнозів** і **не призначаю лікування** — тільки підкажу правильний напрямок.'
    },
    /* WHAT CAN YOU DO — УКР + РУС */
    {
      kw: /що ти вмієш|чим можеш допомогти|що ти можеш|чим ти корисна|що ти знаєш|что умеешь|чем можешь помочь|что ты можешь|чем полезна/i,
      ans: 'Ось чим я можу допомогти:\n\n🏥 **Підказати лікаря** — опишіть симптоми, і я скажу до якого спеціаліста звернутися\n📞 **Контакти** — телефони реєстратури, довідкової, жіночої консультації\n📍 **Адреса та маршрут** — як доїхати до лікарні\n🕐 **Графік роботи** — поліклініка, стаціонар\n🌐 **Онлайн-запис** — посилання на h24.ua\n\nЗапитуйте — я тут! 😊'
    },
    /* THANKS — УКР + РУС */
    {
      kw: /дякую|спасибі|дуже дякую|щиро дякую|спасибо|благодар/i,
      ans: 'Будь ласка! Піклуйтеся про своє здоров\'я. Якщо виникнуть ще питання — завжди тут. 🌿'
    },
    /* BOOKING / APPOINTMENT — УКР + РУС */
    {
      kw: /запис|записат|як потрапит|прийом|талон|онлайн|h24|записаться|как попасть|как записаться|как попасть на приём/i,
      ans: 'Записатися на консультацію можна кількома способами:\n\n🌐 **Онлайн:** h24.ua/organizacia/7856-knp-hor-okl\n📞 **Реєстратура:** 057 705-66-91, 057 704-72-75\n📱 **Мобільні:** 093-972-75-02, 093-971-41-13\n\n🏢 **Поліклініка:** пн–пт 08:00–15:42\n🏥 **Стаціонар:** цілодобово (24/7)'
    },
    /* CONTACTS / ADDRESS — УКР + РУС */
    {
      kw: /телефон|номер|контакт|адрес|як зв\'язат|як зателефон|де знаходит|як доїхат|метро|добратис|телефоны|как добраться|где находится|как проехать/i,
      ans: CONTACTS_TEXT
    },
    /* WORKING HOURS — УКР + РУС */
    {
      kw: /робочий час|графік|коли відкрит|час роботи|режим роботи|до якої|з якої|часы работы|режим работы|когда открыто|расписание/i,
      ans: 'Графік роботи КНП ХОР «ОКЛ»:\n\n🏥 **Стаціонар:** цілодобово (24/7)\n🏢 **Поліклініка:** понеділок–п\'ятниця, 08:00–15:42\n🤰 **Жіноча консультація:** 057 704-72-21\n\nПо вихідних — тільки ургентна допомога (стаціонар).'
    },
    /* HEART / CARDIOLOGY — УКР + РУС */
    {
      kw: /серц|аритм|тиск|серцебиття|задишк|кардіо|стенокард|інфаркт|груд.*біл|біл.*груд|болит.*сердц|давление|аритмия|сердцебиение|одышка|сердце|кардиолог/i,
      ans: 'За скаргами на серце, підвищений/знижений тиск, аритмію або задишку рекомендую звернутися до **кардіолога**.\n\n📞 Запис: 057 705-66-91 або онлайн h24.ua\n\n*Якщо симптоми різко погіршилися або ви відчуваєте гострий біль — негайно телефонуйте 103.*'
    },
    /* NEUROLOGY — УКР + РУС */
    {
      kw: /голов.*біл|біл.*голов|мігрень|запаморочен|оніміння|слабкіст.*руки|слабкіст.*ноги|хребет|спина|неврологія|нервов|сон.*порушен|тремт|координац|болит.*голов|головная боль|головокружени|онемени|позвоночник|неврология|невролог/i,
      ans: 'Такі скарги (головний біль, запаморочення, оніміння, проблеми зі спиною або хребтом) — привід звернутися до **невролога**.\n\n📞 Запис: 057 705-66-91 або онлайн h24.ua\n\n*Якщо є раптова слабкість у половині тіла, порушення мовлення або різкий головний біль — це може бути ознакою інсульту, терміново телефонуйте 103!*'
    },
    /* OPHTHALMOLOGY — УКР + РУС */
    {
      kw: /очі|зір|зорові|сльозоточ|глаукома|катаракта|сітківк|офтальмо|темніє.*очах|мушки.*зору|болят.*глаза|зрение|глаза|слезотечение|окулист|офтальмолог/i,
      ans: 'За проблемами зі зором, сльозотечею, симптомами глаукоми або катаракти рекомендую звернутися до **офтальмолога** (лікаря-окуліста).\n\n📞 Запис: 057 705-66-91 або онлайн h24.ua'
    },
    /* ENT — ГОРЛО, ВУХО, НІС — УКР + РУС (НОВИЙ РОЗДІЛ) */
    {
      kw: /горло|біль.*горл|болить горло|вухо|болить вухо|ніс|нежить|закладен.*ніс|лор|отоларинг|гайморит|тонзиліт|ангіна|фарингіт|болит.*горло|болит.*ухо|насморк|заложен.*нос|отит|гайморит|тонзиллит|ангина|фарингит/i,
      ans: 'Скарги на горло, вуха або ніс (ангіна, отит, гайморит, нежить) — зверніться до **лікаря-отоларинголога (ЛОР)**.\n\n📞 Запис: 057 705-66-91 або онлайн h24.ua'
    },
    /* TEMPERATURE / FEVER — УКР + РУС (НОВИЙ РОЗДІЛ) */
    {
      kw: /температур|гарячк|жар|лихоманк|висока темп|підвищена темп|fever|озноб|потіє.*вночі|температура|высокая температура|жар|лихорадка|озноб|потею/i,
      ans: 'Підвищена температура може бути симптомом різних захворювань. Залежно від інших ознак рекомендую:\n\n🔹 З кашлем/задишкою → **пульмонолог** або терапевт\n🔹 З болем у горлі → **ЛОР-лікар**\n🔹 З болем у животі → **гастроентеролог** або хірург\n🔹 З болем у суглобах → **ревматолог**\n\n📞 Запис: 057 705-66-91 або онлайн h24.ua\n\n*При дуже високій температурі (39°C+) або різкому погіршенні — телефонуйте 103.*'
    },
    /* ABDOMINAL PAIN — УКР + РУС (НОВИЙ РОЗДІЛ) */
    {
      kw: /живіт|болить живіт|біль.*живот|болі в животі|шлун|кишечник|печінк|гастрит|виразк|нудота|блювот|підшлункова|жовчний|рефлюкс|здуття|болит.*живот|боль.*живот|желудок|кишечник|печень|тошнота|рвота|вздутие|изжога/i,
      ans: 'Скарги на живіт, шлунок, кишечник або нудоту — зверніться до **гастроентеролога**.\n\n📞 Запис: 057 705-66-91 або онлайн h24.ua\n\n*При гострому сильному болю в животі — негайно телефонуйте 103 або приїжджайте до стаціонару цілодобово.*'
    },
    /* ORTHOPEDICS — УКР + РУС */
    {
      kw: /суглоб|перелом|травм|колін|плечо|стегн|ортопед|кульгавість|кість|артроз|протезування|болит.*нога|болит.*рука|болит.*колено|болит.*спина|сустав|перелом|травма|колено|бедро|артроз/i,
      ans: 'За травмами, болями у суглобах, переломами або захворюваннями опорно-рухового апарату рекомендую **ортопеда-травматолога**.\n\n📞 Запис: 057 705-66-91 або онлайн h24.ua\n\n*При гострих травмах — відділення цілодобово (стаціонар).*'
    },
    /* ENDOCRINOLOGY — УКР + РУС */
    {
      kw: /цукров.*діабет|діабет|щитоподібн|гормон|ендокрин|ожиріння|схуднен|тиреоїд|сахарн.*диабет|диабет|щитовидн|гормоны|эндокринолог|ожирение|похудени/i,
      ans: 'Скарги, пов\'язані з цукровим діабетом, щитоподібною залозою або гормональними порушеннями — до **ендокринолога**.\n\n📞 Запис: 057 705-66-91 або онлайн h24.ua'
    },
    /* RHEUMATOLOGY — УКР + РУС */
    {
      kw: /ревматизм|ревматоїдн|подагра|артрит.*запальн|суглоби.*набряк|ревматолог|ревматизм|ревматоидн|подагра|ревматолог/i,
      ans: 'За симптомами ревматоїдного артриту, подагри або системних захворювань сполучної тканини рекомендую звернутися до **ревматолога**.\n\n📞 Запис: 057 705-66-91 або онлайн h24.ua'
    },
    /* PULMONOLOGY / ALLERGOLOGY — УКР + РУС */
    {
      kw: /кашел|астма|бронхіт|легені|хозл|алергія|сінна.*лихоманк|пульмонолог|кашель|астма|бронхит|легкие|аллергия|аллерголог|пульмонолог/i,
      ans: 'Скарги на кашель, задишку, бронхіальну астму або алергічні реакції — привід відвідати **пульмонолога/алерголога**.\n\n📞 Запис: 057 705-66-91 або онлайн h24.ua'
    },
    /* NEUROSURGERY — УКР + РУС */
    {
      kw: /нейрохірург|грижа.*диск|міжхребцев.*грижа|пухлин.*мозку|черепно-мозков|нейрохирург|грыжа.*диск|опухоль.*мозга/i,
      ans: 'При підозрі на грижу міжхребцевого диска, пухлини головного або спинного мозку рекомендую консультацію **нейрохірурга**.\n\n📞 Запис: 057 705-66-91 або онлайн h24.ua'
    },
    /* SURGERY — УКР + РУС */
    {
      kw: /апендицит|жовчн.*камін|жовчнокам|грижа(?!.*диск)|лапароскоп|хірург(?!.*нейро|.*серц)|аппендицит|желчнокаменн|грыжа(?!.*диск)|хирург/i,
      ans: 'За хірургічними скаргами (апендицит, грижа, жовчнокам\'яна хвороба тощо) рекомендую **хірурга загального профілю**.\n\n📞 Запис: 057 705-66-91 або онлайн h24.ua\n\n*При гострому болю — стаціонар приймає цілодобово.*'
    },
    /* DERMATOLOGY — УКР + РУС */
    {
      kw: /шкіра|висипання|дерматит|псоріаз|екзема|акне|вугрі|родимк|дерматолог|статев.*інфекц|кожа|высыпания|дерматит|псориаз|экзема|акне|дерматолог/i,
      ans: 'Проблеми зі шкірою, висипання, дерматит або підозра на шкірні захворювання — **дерматолог** вам допоможе.\n\n📞 Запис: 057 705-66-91 або онлайн h24.ua'
    },
    /* DENTISTRY — УКР + РУС */
    {
      kw: /зуб|ясна|стоматолог|карієс|щелеп|зубний|зубы|дёсны|стоматолог|кариес|зубная боль/i,
      ans: 'За стоматологічними питаннями звертайтеся до **стоматолога** нашої лікарні.\n\n📞 Запис: 057 705-66-91 або онлайн h24.ua'
    },
    /* GYNECOLOGY — УКР + РУС */
    {
      kw: /вагітніст|вагітна|гінекологія|гінеколог|акушер|місячн|менструац|яєчник|матка|жіноч.*консультац|беременност|беременна|гинеколог|акушер|месячные|менструация|яичники|матка/i,
      ans: 'Питання вагітності, гінекологічні скарги або планування — звертайтеся до **акушера-гінеколога** або до жіночої консультації.\n\n📞 **Жіноча консультація:** 057 704-72-21\n📞 Реєстратура: 057 705-66-91 або онлайн h24.ua'
    },
    /* NEPHROLOGY — УКР + РУС */
    {
      kw: /нирки|нирков|сечовий|пієлонефрит|нефролог|набряки.*нирк|болить.*нирки|почки|почечн|мочевой|пиелонефрит|нефролог|отёки|болят.*почки/i,
      ans: 'Проблеми з нирками або сечовивідними шляхами (набряки, болі, зміни в аналізах) — **нефролог** допоможе.\n\n📞 Запис: 057 705-66-91 або онлайн h24.ua'
    },
    /* HEMATOLOGY — УКР + РУС */
    {
      kw: /гемоглобін|анемія|тромбоцит|лейкоцит|гематолог|кровотвор|гемоглобин|анемия|тромбоциты|лейкоциты|гематолог/i,
      ans: 'Зміни в аналізах крові (анемія, зміни лейкоцитів/тромбоцитів) — привід відвідати **гематолога**.\n\n📞 Запис: 057 705-66-91 або онлайн h24.ua'
    },
    /* PSYCHIATRY — УКР + РУС */
    {
      kw: /депресія|тривог|панічна.*атак|психіатр|психологія|безсонн|нервов.*зрив|думки.*суїц|депрессия|тревог|панические.*атак|психиатр|бессонниц|нервный срыв/i,
      ans: 'Якщо вас турбують емоційний стан, тривога, депресія або порушення сну — рекомендую консультацію **психіатра**. Це звично і правильно — піклуватися про психічне здоров\'я.\n\n📞 Запис: 057 705-66-91 або онлайн h24.ua'
    },
    /* REHABILITATION — УКР + РУС */
    {
      kw: /реабілітац|відновлен|фізіотерап|лфк|масаж.*медичн|після.*операц|реабилитац|восстановлени|физиотерапи|после.*операц/i,
      ans: 'Для відновлення після операції або хвороби — **відділення реабілітації та фізіотерапії**.\n\n📞 Запис: 057 705-66-91 або онлайн h24.ua'
    },
    /* DIAGNOSTICS — УКР + РУС */
    {
      kw: /аналіз|узд|ультразвук|кт |рентген|ехокардіограм|ендоскоп|гастроскоп|колоноскоп|мрт|томограф|анализы|узи|ультразвук|рентген|эндоскоп|гастроскоп|колоноскоп|томограф/i,
      ans: 'В нашій лікарні є повний спектр діагностики:\n\n🔬 Клінічна лабораторія (аналізи)\n📡 УЗД та ехокардіографія\n🩻 Рентген та КТ\n📊 Функціональна діагностика\n🔭 Ендоскопія (гастро- та колоноскопія)\n\nНаправлення на дослідження видає лікар-спеціаліст.\n\n📞 Запис: 057 705-66-91 або онлайн h24.ua'
    },
    /* GENERAL PAIN — broad catch — УКР + РУС */
    {
      kw: /болить|болі |біль |болю|боляче|больно|болит|боль |боли /i,
      ans: 'Опишіть докладніше, де саме болить та які ще є симптоми — я підкажу, до якого спеціаліста звернутися.\n\nАбо зателефонуйте до реєстратури, там допоможуть записатися до потрібного лікаря:\n\n📞 **057 705-66-91** / **057 704-72-75**\n📱 **093-972-75-02**\n🌐 h24.ua/organizacia/7856-knp-hor-okl'
    }
  ];

  function localAnswer(text){
    var t = (text||'').trim();
    /* Check emergency first */
    for(var i=0;i<RULES.length;i++){
      if(RULES[i].kw.test(t)) return RULES[i].ans;
    }
    /* Fallback */
    return 'Дякую за ваше запитання.\n\nОпишіть детальніше ваші **симптоми або скарги** — я підкажу, до якого спеціаліста вам краще звернутися.\n\nАбо зв\'яжіться з нашою реєстратурою напряму:\n📞 **057 705-66-91** / **057 704-72-75**\n📱 **093-972-75-02**\n🌐 Онлайн-запис: h24.ua/organizacia/7856-knp-hor-okl';
  }

  async function callAI(messages){

    /* ── 1. Google Gemini 2.0 Flash ─────────────────── */
    if(window.OKL_GEMINI_KEY){
      try{
        var contents=[];
        for(var k=0;k<messages.length;k++){
          contents.push({
            role: messages[k].role==='user'?'user':'model',
            parts:[{text: messages[k].content}]
          });
        }
        var gBody={
          system_instruction:{parts:[{text:SYSTEM_PROMPT_LOCAL}]},
          contents:contents,
          generationConfig:{maxOutputTokens:700,temperature:0.7},
          safetySettings:[
            {category:'HARM_CATEGORY_DANGEROUS_CONTENT',threshold:'BLOCK_NONE'},
            {category:'HARM_CATEGORY_HARASSMENT',        threshold:'BLOCK_NONE'},
            {category:'HARM_CATEGORY_HATE_SPEECH',       threshold:'BLOCK_NONE'},
            {category:'HARM_CATEGORY_SEXUALLY_EXPLICIT', threshold:'BLOCK_NONE'}
          ]
        };
        var gr=await fetch(
          'https://generativelanguage.googleapis.com/v1beta/models/gemini-flash-latest:generateContent?key='+window.OKL_GEMINI_KEY,
          {method:'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify(gBody)}
        );
        var gd=await gr.json();
        if(!gr.ok){ console.warn('Gemini error:',gd.error&&gd.error.message); }
        else {
          var gParts=gd.candidates&&gd.candidates[0]&&gd.candidates[0].content&&gd.candidates[0].content.parts;
          var gt=gParts&&gParts.length>0&&gParts[0].text;
          if(gt) return gt;
          console.warn('Gemini empty response, finishReason:',gd.candidates&&gd.candidates[0]&&gd.candidates[0].finishReason);
        }
      }catch(e){ console.warn('Gemini exception:',e.message); }
    }

    /* ── 2. OpenAI / ChatGPT ────────────────────────── */
    if(window.OKL_OPENAI_KEY){
      try{
        var omsgs=[{role:'system',content:SYSTEM_PROMPT_LOCAL}].concat(messages);
        var or_=await fetch('https://api.openai.com/v1/chat/completions',{
          method:'POST',
          headers:{'Content-Type':'application/json','Authorization':'Bearer '+window.OKL_OPENAI_KEY},
          body:JSON.stringify({model:'gpt-4o-mini',messages:omsgs,max_tokens:700})
        });
        var od=await or_.json();
        if(!or_.ok){ console.warn('OpenAI error:',od.error&&od.error.message); }
        else{
          var ot=od.choices&&od.choices[0]&&od.choices[0].message&&od.choices[0].message.content;
          if(ot) return ot;
        }
      }catch(e){ console.warn('OpenAI exception:',e.message); }
    }

    /* ── 3. Claude через серверний proxy ────────────── */
    var endpoints=[];
    if(window.OKL_AI_ENDPOINT) endpoints.push(window.OKL_AI_ENDPOINT);
    endpoints.push('/api/ai-consultant','/ai-consultant-proxy.php');
    for(var i=0;i<endpoints.length;i++){
      try{
        var r=await fetch(endpoints[i],{
          method:'POST',headers:{'Content-Type':'application/json'},
          body:JSON.stringify({system:SYSTEM_PROMPT_LOCAL,messages:messages})
        });
        if(r.ok){var d=await r.json();if(d&&d.reply)return d.reply;}
      }catch(e){}
    }

    /* ── 4. Локальний fallback ───────────────────────── */
    var lastMsg='';
    for(var j=messages.length-1;j>=0;j--){
      if(messages[j].role==='user'){lastMsg=messages[j].content;break;}
    }
    return localAnswer(lastMsg);
  }

  async function aiSend(){
    if(AI_LOADING || !aiInput) return;
    var txt = aiInput.value.trim();
    if(!txt) return;
    aiInput.value=''; aiInput.style.height='auto';
    aiAddMsg('user', txt);
    AI_HISTORY.push({role:'user',content:txt});
    if(aiChipsEl) aiChipsEl.style.display='none';
    aiShowTyping(); AI_LOADING=true;
    try{
      var reply = await callAI(AI_HISTORY.slice(-14));
      AI_HISTORY.push({role:'assistant',content:reply});
      aiHideTyping(); aiAddMsg('bot', reply);
    } catch(e){
      aiHideTyping();
      aiAddMsg('bot','Вибачте, виникла технічна помилка. Будь ласка, зверніться до нас:\n📞 **057 705-67-22** (довідкова)\n📞 **057 705-66-91** (реєстратура)\n\nАбо запишіться онлайн: **h24.ua**');
    }
    AI_LOADING=false;
  }

  aiOpenBtn.addEventListener('click', aiToggle);
  if(aiCloseBtn) aiCloseBtn.addEventListener('click', aiToggle);
  if(aiSendBtn) aiSendBtn.addEventListener('click', aiSend);
  if(aiInput){
    aiInput.addEventListener('keydown',function(e){
      if(e.key==='Enter'&&!e.shiftKey){e.preventDefault();aiSend();}
    });
    aiInput.addEventListener('input',function(){
      this.style.height='auto';
      this.style.height=Math.min(this.scrollHeight,90)+'px';
    });
  }
  document.querySelectorAll('.ai-chip').forEach(function(chip){
    chip.addEventListener('click',function(){
      if(!aiInput) return;
      aiInput.value=this.textContent;
      aiSend();
    });
  });

}); /* end ready */
})();
