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
  var WP_API = 'https://rch.kh.gov.ua/wp-json/wp/v2/posts';

  /* Форматуємо дату: "2026-03-31T..." → "31 березня 2026" */
  var UA_MONTHS = ['січня','лютого','березня','квітня','травня','червня',
                   'липня','серпня','вересня','жовтня','листопада','грудня'];
  function formatDate(iso){
    var d = new Date(iso);
    return d.getDate()+' '+UA_MONTHS[d.getMonth()]+' '+d.getFullYear();
  }

  /* Прибираємо HTML-теги, декодуємо HTML-entities */
  function stripHtml(html){
    var tmp = document.createElement('div');
    tmp.innerHTML = html||'';
    return (tmp.textContent||tmp.innerText||'').trim();
  }

  /* Рендер карток (grid або list) */
  function renderNewsCards(posts, container, mode){
    if(!container||!posts.length) return;
    container.innerHTML = posts.map(function(p){
      var title   = stripHtml(p.title.rendered);
      var excerpt = stripHtml(p.excerpt.rendered).slice(0,180)||(stripHtml(p.content.rendered).slice(0,180));
      if(excerpt.length===180) excerpt+='…';
      var date    = formatDate(p.date);
      var cats    = (p._embedded&&p._embedded['wp:term']&&p._embedded['wp:term'][0])||[];
      var tag     = (cats[0]&&cats[0].name&&cats[0].name!=='Uncategorized')?cats[0].name:'Новини';
      var img     = p._embedded&&p._embedded['wp:featuredmedia']&&p._embedded['wp:featuredmedia'][0]&&p._embedded['wp:featuredmedia'][0].source_url;
      var cls     = mode==='list'?'newsCard newsCard--wide reveal':'newsCard reveal';
      var hTag    = mode==='list'?'h2':'h3';
      return '<article class="'+cls+'" onclick="location.href=\'news.html?id='+p.id+'\'" style="cursor:pointer">'+
        (img?'<div class="newsCard__img"><img src="'+img+'" alt="'+title+'" loading="lazy"></div>':'')+
        '<div class="newsCard__meta"><span class="newsCard__tag">'+tag+'</span><span class="newsCard__date">'+date+'</span></div>'+
        '<'+hTag+' class="newsCard__title">'+title+'</'+hTag+'>'+
        (excerpt?'<p class="newsCard__short">'+excerpt+'</p>':'')+
        '<span class="newsCard__link">Читати далі →</span>'+
      '</article>';
    }).join('');
    /* animate */
    if('IntersectionObserver' in window){
      var obs=new IntersectionObserver(function(entries){
        entries.forEach(function(e){if(e.isIntersecting){e.target.classList.add('isIn');obs.unobserve(e.target);}});
      },{threshold:0.08});
      container.querySelectorAll('.reveal').forEach(function(el){obs.observe(el);});
    } else {
      container.querySelectorAll('.reveal').forEach(function(el){el.classList.add('isIn');});
    }
  }

  /* Скелетон-плейсхолдер поки завантажується */
  function skeletonCards(n){
    return Array(n).fill(
      '<article class="newsCard" style="pointer-events:none">'+
        '<div style="height:14px;width:60%;background:var(--ink-06);border-radius:4px;margin-bottom:12px"></div>'+
        '<div style="height:20px;width:90%;background:var(--ink-06);border-radius:4px;margin-bottom:8px"></div>'+
        '<div style="height:14px;width:75%;background:var(--ink-06);border-radius:4px"></div>'+
      '</article>'
    ).join('');
  }

  /* ── Блок на головній (3 новини) ─────────────────── */
  var newsGrid = document.getElementById('news-grid');
  if(newsGrid){
    newsGrid.innerHTML = skeletonCards(3);
    fetch(WP_API+'?per_page=3&_embed&orderby=date&order=desc')
      .then(function(r){return r.json();})
      .then(function(posts){renderNewsCards(posts,newsGrid,'grid');})
      .catch(function(){newsGrid.innerHTML='<p style="color:var(--ink-60)">Не вдалося завантажити новини.</p>';});
  }

  /* ── Сторінка новин ──────────────────────────────── */
  var newsListEl  = document.getElementById('news-list');
  var newsArticle = document.getElementById('news-article');

  if(newsListEl){
    var params = new URLSearchParams(window.location.search);
    var openId  = parseInt(params.get('id'),10)||0;

    if(openId && newsArticle){
      /* Показати конкретну статтю */
      newsListEl.style.display='none';
      newsArticle.style.display='block';
      newsArticle.innerHTML='<div style="height:32px;width:120px;background:var(--ink-06);border-radius:8px;margin-bottom:28px"></div><div style="height:28px;width:80%;background:var(--ink-06);border-radius:6px;margin-bottom:12px"></div><div style="height:16px;width:40%;background:var(--ink-06);border-radius:4px"></div>';
      fetch(WP_API+'/'+openId+'?_embed')
        .then(function(r){return r.json();})
        .then(function(p){
          var title   = stripHtml(p.title.rendered);
          var date    = formatDate(p.date);
          var cats    = (p._embedded&&p._embedded['wp:term']&&p._embedded['wp:term'][0])||[];
          var tag     = (cats[0]&&cats[0].name&&cats[0].name!=='Uncategorized')?cats[0].name:'Новини';
          var img     = p._embedded&&p._embedded['wp:featuredmedia']&&p._embedded['wp:featuredmedia'][0]&&p._embedded['wp:featuredmedia'][0].source_url;
          var content = p.content.rendered; /* зберігаємо оригінальний HTML з WP */
          /* оновлюємо breadcrumb і заголовок page-hero якщо є */
          var bc = document.getElementById('breadcrumbs');
          if(bc) bc.innerHTML='<a href="index.html">Головна</a> / <a href="news.html">Новини</a> / '+title;
          var pt = document.getElementById('page-title');
          if(pt) pt.textContent=title;
          var pl = document.getElementById('page-lead');
          if(pl) pl.textContent=date;
          newsArticle.innerHTML=
            '<a class="btn btn--ghost btn--sm" href="news.html" style="margin-bottom:24px;display:inline-flex">← Усі новини</a>'+
            '<div class="pill" style="margin-bottom:12px">'+tag+'</div>'+
            '<h1 class="page-hero__title" style="margin-bottom:8px">'+title+'</h1>'+
            '<p class="muted" style="margin-bottom:28px;font-size:14px">'+date+'</p>'+
            (img?'<img src="'+img+'" alt="'+title+'" style="width:100%;border-radius:var(--r-lg);margin-bottom:28px;object-fit:cover;max-height:400px">':'')+
            '<div class="newsArticle__body">'+content+'</div>'+
            '<div style="margin-top:32px;padding-top:24px;border-top:1px solid var(--ink-12)">'+
              '<a class="btn btn--outline" href="news.html">← Повернутись до новин</a>'+
              '<a class="btn btn--primary" href="'+p.link+'" target="_blank" rel="noopener" style="margin-left:12px">Оригінал на сайті ОКЛ ↗</a>'+
            '</div>';
        })
        .catch(function(){
          newsArticle.innerHTML='<p>Не вдалося завантажити статтю. <a href="news.html">← Повернутись</a></p>';
        });
    } else {
      /* Список усіх новин з пагінацією */
      var newsPage = parseInt(params.get('page'),10)||1;
      var perPage  = 12;
      newsListEl.innerHTML = skeletonCards(6);
      fetch(WP_API+'?per_page='+perPage+'&page='+newsPage+'&_embed&orderby=date&order=desc')
        .then(function(r){
          var total = parseInt(r.headers.get('X-WP-Total')||'0',10);
          var pages = parseInt(r.headers.get('X-WP-TotalPages')||'1',10);
          return r.json().then(function(posts){return {posts:posts,total:total,pages:pages};});
        })
        .then(function(data){
          renderNewsCards(data.posts, newsListEl, 'list');
          /* Пагінація */
          if(data.pages>1){
            var pag='<div style="display:flex;gap:8px;margin-top:32px;flex-wrap:wrap">';
            for(var pg=1;pg<=data.pages;pg++){
              var active=pg===newsPage;
              pag+='<a href="news.html?page='+pg+'" class="btn '+(active?'btn--primary':'btn--ghost')+' btn--sm">'+pg+'</a>';
            }
            pag+='</div>';
            newsListEl.insertAdjacentHTML('beforeend',pag);
          }
        })
        .catch(function(){
          newsListEl.innerHTML='<p style="color:var(--ink-60)">Не вдалося завантажити новини. Спробуйте пізніше.</p>';
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
    /* EMERGENCY */
    {
      kw: /серцев.*напад|інсульт|не дихає|задихаю|зупинка серця|непритомн|дуже сильний біль у груд|швидку/i,
      ans: '🚨 **Увага! Терміново телефонуйте 103** або 112!\n\nЦі симптоми потребують негайної медичної допомоги — не чекайте, викликайте швидку. Якщо є можливість — самостійно доїжджайте до приймального відділення (пр. Незалежності, 13, цілодобово).'
    },
    /* GREETINGS */
    {
      kw: /^(привіт|вітаю|добрий|доброго|добрий день|доброго дня|добрий ранок|доброго ранку|добрий вечір|доброго вечора|hello|hi|здравствуй|здрасте|хай)\b/i,
      ans: 'Вітаю! Я Анна, медичний помічник Обласної клінічної лікарні Харкова.\n\nОпишіть ваші симптоми або запитання — підкажу, до якого **лікаря-спеціаліста** вам звернутися та як записатися. Я не ставлю діагнозів і не призначаю лікування.'
    },
    /* THANKS */
    {
      kw: /дякую|спасибі|дуже дякую|щиро дякую/i,
      ans: 'Будь ласка! Піклуйтеся про своє здоров\'я. Якщо виникнуть ще питання — завжди тут. 🌿'
    },
    /* BOOKING / APPOINTMENT */
    {
      kw: /запис|записат|як потрапит|прийом|талон|онлайн|h24/i,
      ans: 'Записатися на консультацію можна кількома способами:\n\n🌐 **Онлайн:** h24.ua/organizacia/7856-knp-hor-okl\n📞 **Реєстратура:** 057 705-66-91, 057 704-72-75\n📱 **Мобільні:** 093-972-75-02, 093-971-41-13\n\n🏢 **Поліклініка:** пн–пт 08:00–15:42\n🏥 **Стаціонар:** цілодобово (24/7)'
    },
    /* CONTACTS / PHONES */
    {
      kw: /телефон|номер|контакт|адрес|як зв\'язат|як зателефон|де знаходит|як доїхат|метро|добратис/i,
      ans: CONTACTS_TEXT
    },
    /* WORKING HOURS */
    {
      kw: /робочий час|графік|коли відкрит|час роботи|режим роботи|до якої|з якої/i,
      ans: 'Графік роботи КНП ХОР «ОКЛ»:\n\n🏥 **Стаціонар:** цілодобово (24/7)\n🏢 **Поліклініка:** понеділок–п\'ятниця, 08:00–15:42\n🤰 **Жіноча консультація:** 057 704-72-21\n\nПо вихідних — тільки ургентна допомога (стаціонар).'
    },
    /* HEART / CARDIOLOGY */
    {
      kw: /серц|аритм|тиск|серцебиття|задишк|кардіо|стенокард|інфаркт|груд.*біл|біл.*груд/i,
      ans: 'За скаргами на серце, підвищений/знижений тиск, аритмію або задишку рекомендую звернутися до **кардіолога**.\n\n📞 Запис: 057 705-66-91 або онлайн h24.ua\n\n*Якщо симптоми різко погіршилися або ви відчуваєте гострий біль — негайно телефонуйте 103.*'
    },
    /* NEUROLOGY */
    {
      kw: /голов.*біл|біл.*голов|мігрень|запаморочен|оніміння|слабкіст.*руки|слабкіст.*ноги|хребет|спина|неврологія|нервов|сон.*порушен|тремт|координац/i,
      ans: 'Такі скарги (головний біль, запаморочення, оніміння, проблеми зі спиною або хребтом) — привід звернутися до **невролога**.\n\n📞 Запис: 057 705-66-91 або онлайн h24.ua\n\n*Якщо є раптова слабкість у половині тіла, порушення мовлення або різкий головний біль — це може бути ознакою інсульту, терміново телефонуйте 103!*'
    },
    /* OPHTHALMOLOGY */
    {
      kw: /очі|зір|зорові|сльозоточ|глаукома|катаракта|сітківк|офтальмо|темніє.*очах|мушки.*зору/i,
      ans: 'За проблемами зі зором, сльозотечею, симптомами глаукоми або катаракти рекомендую звернутися до **офтальмолога** (лікаря-окуліста).\n\n📞 Запис: 057 705-66-91 або онлайн h24.ua'
    },
    /* ORTHOPEDICS */
    {
      kw: /суглоб|перелом|травм|колін|плечо|стегн|хребет.*травм|ортопед|кульгавість|кість|артроз|протезування/i,
      ans: 'За травмами, болями у суглобах, переломами або захворюваннями опорно-рухового апарату рекомендую **ортопеда-травматолога**.\n\n📞 Запис: 057 705-66-91 або онлайн h24.ua\n\n*При гострих травмах — відділення цілодобово (стаціонар).*'
    },
    /* ENDOCRINOLOGY */
    {
      kw: /цукров.*діабет|діабет|щитоподібн|гормон|ендокрин|ожиріння|схуднен|тиреоїд|підшлункова/i,
      ans: 'Скарги, пов\'язані з цукровим діабетом, щитоподібною залозою або гормональними порушеннями — до **ендокринолога**.\n\n📞 Запис: 057 705-66-91 або онлайн h24.ua'
    },
    /* RHEUMATOLOGY */
    {
      kw: /ревматизм|ревматоїдн|подагра|системний червоний вовчак|артрит.*запальн|суглоби.*набряк|ревматолог/i,
      ans: 'За симптомами ревматоїдного артриту, подагри або системних захворювань сполучної тканини рекомендую звернутися до **ревматолога**.\n\n📞 Запис: 057 705-66-91 або онлайн h24.ua'
    },
    /* PULMONOLOGY / ALLERGOLOGY */
    {
      kw: /кашел|астма|бронхіт|легені|задишк.*вночі|хозл|алергія|нежить|сінна.*лихоманк|пульмонолог/i,
      ans: 'Скарги на кашель, задишку, бронхіальну астму або алергічні реакції — привід відвідати **пульмонолога/алерголога**.\n\n📞 Запис: 057 705-66-91 або онлайн h24.ua'
    },
    /* GASTROENTEROLOGY */
    {
      kw: /шлун|кишечник|печінк|гастрит|виразк|нудота|блювот|підшлункова|жовчний|гастроентерolog|рефлюкс|здуття/i,
      ans: 'Проблеми зі шлунком, кишечником, печінкою або підшлунковою залозою — звертайтеся до **гастроентеролога**.\n\n📞 Запис: 057 705-66-91 або онлайн h24.ua'
    },
    /* NEUROSURGERY */
    {
      kw: /нейрохірург|грижа.*диск|міжхребцев.*грижа|пухлин.*мозку|черепно-мозков/i,
      ans: 'При підозрі на грижу міжхребцевого диска, пухлини головного або спинного мозку рекомендую консультацію **нейрохірурга**.\n\n📞 Запис: 057 705-66-91 або онлайн h24.ua'
    },
    /* SURGERY */
    {
      kw: /апендицит|жовчн.*камін|жовчнокам|грижа(?!.*диск)|лапароскоп|хірург(?!.*нейро|.*серц)/i,
      ans: 'За хірургічними скаргами (апендицит, грижа, жовчнокам\'яна хвороба тощо) рекомендую **хірурга загального профілю**.\n\n📞 Запис: 057 705-66-91 або онлайн h24.ua\n\n*При гострому болю — стаціонар приймає цілодобово.*'
    },
    /* CARDIOSURGERY */
    {
      kw: /серцево-судинн.*хірург|кардіохірург|аорт|клапан.*серц|шунтування/i,
      ans: 'Питання серцево-судинної хірургії (пороки клапанів, аорта, шунтування) — консультація **кардіохірурга**.\n\n📞 Запис: 057 705-66-91 або онлайн h24.ua'
    },
    /* DERMATOLOGY */
    {
      kw: /шкіра|висипання|дерматит|псоріаз|екзема|акне|вугрі|родимк|дерматолог|венерolog|статев.*інфекц/i,
      ans: 'Проблеми зі шкірою, висипання, дерматит або підозра на шкірні захворювання — **дерматолог** вам допоможе.\n\n📞 Запис: 057 705-66-91 або онлайн h24.ua'
    },
    /* DENTISTRY */
    {
      kw: /зуб|ясна|стоматолог|карієс|щелеп|зубний/i,
      ans: 'За стоматологічними питаннями звертайтеся до **стоматолога** нашої лікарні.\n\n📞 Запис: 057 705-66-91 або онлайн h24.ua'
    },
    /* GYNECOLOGY / OBSTETRICS */
    {
      kw: /вагітніст|вагітна|гінекологія|гінеколог|акушер|місячн|менструац|яєчник|матка|жіноч.*консультац/i,
      ans: 'Питання вагітності, гінекологічні скарги або планування — звертайтеся до **акушера-гінеколога** або до жіночої консультації.\n\n📞 **Жіноча консультація:** 057 704-72-21\n📞 Реєстратура: 057 705-66-91 або онлайн h24.ua'
    },
    /* NEPHROLOGY */
    {
      kw: /нирки|нирков|сечовий|пієлонефрит|нефролог|набряки.*нирк|сеч.*аналіз.*поган/i,
      ans: 'Проблеми з нирками або сечовивідними шляхами (набряки, болі, зміни в аналізах) — **нефролог** допоможе.\n\n📞 Запис: 057 705-66-91 або онлайн h24.ua'
    },
    /* HEMATOLOGY */
    {
      kw: /кров.*погана|гемоглобін|анемія|тромбоцит|лейкоцит|гематолог|кровотвор/i,
      ans: 'Зміни в аналізах крові (анемія, зміни лейкоцитів/тромбоцитів) — привід відвідати **гематолога**.\n\n📞 Запис: 057 705-66-91 або онлайн h24.ua'
    },
    /* PSYCHIATRY */
    {
      kw: /депресія|тривог|панічна.*атак|психіатр|психологія|безсонн|нервов.*зрив|думки.*суїц/i,
      ans: 'Якщо вас турбують емоційний стан, тривога, депресія або порушення сну — рекомендую консультацію **психіатра**. Це звично і правильно — піклуватися про психічне здоров\'я.\n\n📞 Запис: 057 705-66-91 або онлайн h24.ua'
    },
    /* REHABILITATION */
    {
      kw: /реабілітац|відновлен|фізіотерап|лфк|масаж.*медичн|після.*операц/i,
      ans: 'Для відновлення після операції або хвороби — **відділення реабілітації та фізіотерапії**.\n\n📞 Запис: 057 705-66-91 або онлайн h24.ua'
    },
    /* DIAGNOSTICS */
    {
      kw: /аналіз|узд|ультразвук|кт|рентген|ехокардіограм|ендоскоп|гастроскоп|колоноскоп|мрт|томограф/i,
      ans: 'В нашій лікарні є повний спектр діагностики:\n\n🔬 Клінічна лабораторія (аналізи)\n📡 УЗД та ехокардіографія\n🩻 Рентген та КТ\n📊 Функціональна діагностика\n🔭 Ендоскопія (гастро- та колоноскопія)\n\nНаправлення на дослідження видає лікар-спеціаліст.\n\n📞 Запис: 057 705-66-91 або онлайн h24.ua'
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
          'https://generativelanguage.googleapis.com/v1beta/models/gemini-2.0-flash:generateContent?key='+window.OKL_GEMINI_KEY,
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
