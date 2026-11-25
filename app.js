(function(){
var WA_ICON='<svg viewBox="0 0 24 24" width="16" height="16" fill="currentColor"><path d="M12 2a10 10 0 0 0-8.5 15.2L2 22l4.9-1.4A10 10 0 1 0 12 2zm5.2 13.9c-.2.6-1.3 1.2-1.8 1.2-.5.1-1 .2-3.3-.7-2.8-1.2-4.6-4-4.7-4.2-.1-.2-1.1-1.5-1.1-2.8s.7-2 1-2.3c.2-.3.5-.3.7-.3h.5c.2 0 .4 0 .6.5l.9 2.1c.1.2.1.4 0 .5l-.4.6-.4.4c-.1.2-.3.3-.1.6.2.3.8 1.3 1.7 2.1 1.2 1 2.1 1.3 2.4 1.5.3.1.5.1.6-.1l.8-1c.2-.3.4-.2.6-.1l2 1c.3.1.5.2.5.4.1.2.1.8-.2 1.5z"/></svg>';
function el(t,c,x){var e=document.createElement(t);if(c)e.className=c;if(x!=null)e.textContent=x;return e;}
function loadCart(){try{var c=JSON.parse(localStorage.getItem('samdo_cart')||'{}');return c&&typeof c==='object'?c:{};}catch(e){return {};}}
function fmt(n){return (Math.round(n*100)/100).toString();}
function render(D){
  var app=document.getElementById('app'),nav=document.getElementById('nav');app.innerHTML='';nav.innerHTML='';
  var wa=(D.settings&&D.settings.whatsapp)||'',cur=(D.settings&&D.settings.currency)||'ر.س';
  function link(text){return 'https://wa.me/'+wa+'?text='+encodeURIComponent(text);}
  function ord(text,label){var a=el('a','ord');a.href=link(text);a.target='_blank';a.rel='noopener';a.innerHTML=WA_ICON;a.appendChild(el('span',null,label||'اطلب عبر واتساب'));return a;}
  var cart=loadCart(),byId={};(D.items||[]).forEach(function(i){byId[i.id]=i;});
  function lineOf(k){var p=k.split('|'),i=byId[p[0]];if(!i||i.avail===false)return null;var z=null;if(i.sizes&&i.sizes.length){z=i.sizes.filter(function(x){return x.n===p[1];})[0];if(!z)return null;}var pr=z?z.p:i.price;if(pr==null||pr==='')return null;return {k:k,name:i.name,size:z?z.n:'',price:+pr,q:cart[k]};}
  Object.keys(cart).forEach(function(k){if(!lineOf(k))delete cart[k];});
  var ctrls=[];
  function save(){try{localStorage.setItem('samdo_cart',JSON.stringify(cart));}catch(e){}refresh();}
  function setQ(k,q){if(q<=0)delete cart[k];else cart[k]=Math.min(q,50);save();}
  function addCtrl(i,z){
    var pr=z?z.p:i.price;
    if(pr==null||pr===''){return ord('أطلب: '+i.name+(z?' '+z.n:''),'اسأل عبر واتساب');}
    var k=i.id+'|'+(z?z.n:'');var w=el('div','qc');w.setAttribute('data-k',k);ctrls.push(w);return w;
  }
  function paintCtrl(w){var k=w.getAttribute('data-k'),q=cart[k]||0;w.innerHTML='';
    if(!q){var b=el('button','add','+ أضف');b.type='button';b.onclick=function(){setQ(k,1);};w.appendChild(b);}
    else{var m=el('button','qb','−');m.type='button';m.setAttribute('aria-label','إنقاص');m.onclick=function(){setQ(k,q-1);};var pl=el('button','qb','+');pl.type='button';pl.setAttribute('aria-label','زيادة');pl.onclick=function(){setQ(k,q+1);};w.appendChild(pl);w.appendChild(el('span','qn',String(q)));w.appendChild(m);}}
  var bar=document.getElementById('cartbar'),sheet=document.getElementById('cartsheet');
  function lines(){return Object.keys(cart).map(lineOf).filter(Boolean);}
  function total(ls){return ls.reduce(function(a,l){return a+l.price*l.q;},0);}
  function refresh(){ctrls.forEach(paintCtrl);var ls=lines(),n=ls.reduce(function(a,l){return a+l.q;},0);
    bar.hidden=!n;bar.querySelector('.cn').textContent=n;bar.querySelector('.ct').textContent=fmt(total(ls))+' '+cur;
    if(!sheet.hidden)paintSheet();}
  function msg(ls){var t='طلب جديد من منيو صمدو:\n';ls.forEach(function(l,x){t+=(x+1)+'. '+l.name+(l.size?' ('+l.size+')':'')+' × '+l.q+' = '+fmt(l.price*l.q)+' '+cur+'\n';});t+='\nالإجمالي: '+fmt(total(ls))+' '+cur;var nt=document.getElementById('cnote');if(nt&&nt.value.trim())t+='\nملاحظات: '+nt.value.trim();return t;}
  function paintSheet(){var ls=lines(),box=document.getElementById('clines');box.innerHTML='';
    if(!ls.length){sheet.hidden=true;document.body.classList.remove('lock');return;}
    ls.forEach(function(l){var r=el('div','cl');var a=el('div','ci');a.appendChild(el('b',null,l.name));if(l.size)a.appendChild(el('small',null,l.size));a.appendChild(el('span','cp',fmt(l.price)+' '+cur));r.appendChild(a);
      var c=el('div','qc');var pl=el('button','qb','+');pl.type='button';pl.onclick=function(){setQ(l.k,l.q+1);};var m=el('button','qb','−');m.type='button';m.onclick=function(){setQ(l.k,l.q-1);};c.appendChild(pl);c.appendChild(el('span','qn',String(l.q)));c.appendChild(m);r.appendChild(c);r.appendChild(el('span','lt',fmt(l.price*l.q)));box.appendChild(r);});
    document.getElementById('ctotal').textContent=fmt(total(ls))+' '+cur;
    document.getElementById('csend').href='https://wa.me/'+wa+'?text='+encodeURIComponent(msg(ls));}
  bar.onclick=function(){sheet.hidden=false;document.body.classList.add('lock');paintSheet();};
  document.getElementById('cclose').onclick=function(){sheet.hidden=true;document.body.classList.remove('lock');};
  sheet.onclick=function(e){if(e.target===sheet){sheet.hidden=true;document.body.classList.remove('lock');}};
  document.getElementById('cclear').onclick=function(){Object.keys(cart).forEach(function(k){delete cart[k];});save();};
  var cnote=document.getElementById('cnote');cnote.oninput=function(){var ls=lines();if(ls.length)document.getElementById('csend').href='https://wa.me/'+wa+'?text='+encodeURIComponent(msg(ls));};
  var any=false;
  (D.cats||[]).forEach(function(c){
    var its=(D.items||[]).filter(function(i){return i.cat===c.id;});if(!its.length)return;any=true;
    var a=el('a',null,c.name);a.href='#'+c.id;nav.appendChild(a);
    var s=el('section');s.id=c.id;var h=el('h2',null,c.name);if(c.en)h.appendChild(el('em',null,c.en));s.appendChild(h);
    var ul=el('ul');
    its.forEach(function(i){
      var li=el('li',i.avail===false?'off':'');
      if(i.img){var im=el('img','th');im.loading='lazy';im.src=i.img;im.alt=i.name;li.appendChild(im);}
      var it=el('div','it');it.appendChild(el('span','n',i.name));
      var hasSizes=i.sizes&&i.sizes.length;
      if(!hasSizes){
        it.appendChild(el('span','p',i.price!=null&&i.price!==''?fmt(i.price)+' ':''));
        if(i.price!=null&&i.price!==''){var sm=el('small',null,cur);it.lastChild.appendChild(sm);}
      }
      if(i.cal)it.appendChild(el('span','c',i.cal+' سعرة'));
      if(i.desc)it.appendChild(el('span','ds',i.desc));
      li.appendChild(it);
      if(i.avail===false){li.appendChild(el('span','soldout','غير متاح حالياً'));}
      else if(hasSizes){
        var box=el('div','sizes');
        i.sizes.forEach(function(z){
          var r=el('div','sz');var l=el('span','szn',z.n);var p=el('span','p',(z.p!=null&&z.p!==''?fmt(z.p)+' ':''));
          if(z.p!=null&&z.p!=='')p.appendChild(el('small',null,cur));
          r.appendChild(l);r.appendChild(p);
          r.appendChild(addCtrl(i,z));box.appendChild(r);
        });
        li.appendChild(box);
      } else {
        
        li.appendChild(addCtrl(i,null));
      }
      ul.appendChild(li);
    });
    s.appendChild(ul);app.appendChild(s);
  });
  if(!any){app.appendChild(el('p','note big','المنيو قيد التحديث، تواصل معنا عبر واتساب.'));}
  var cs=el('section');cs.id='contact';var ch=el('h2','', 'تواصل معنا');ch.appendChild(el('em',null,'CONTACT'));cs.appendChild(ch);
  cs.appendChild(el('p','note big','كل المشروبات طازجة 100%. الصور للتوضيح فقط. الأسعار بالريال السعودي.'));
  if(wa){var w=el('a','wa','واتساب: +'+wa.replace(/^(\d{3})(\d{2})(\d{3})(\d{4})$/,'$1 $2 $3 $4'));w.href='https://wa.me/'+wa;w.target='_blank';w.rel='noopener';cs.appendChild(w);
    var t=el('p','tel');var ta=el('a',null,'+'+wa.replace(/^(\d{3})(\d{2})(\d{3})(\d{4})$/,'$1 $2 $3 $4'));ta.href='tel:+'+wa;ta.dir='ltr';t.appendChild(ta);cs.appendChild(t);}
  app.appendChild(cs);
  refresh();
  /*spy*/var links=[].slice.call(nav.children);if('IntersectionObserver' in window){var io=new IntersectionObserver(function(es){es.forEach(function(e){if(e.isIntersecting){links.forEach(function(l){var on=l.getAttribute('href')==='#'+e.target.id;l.classList.toggle('on',on);if(on)l.scrollIntoView({inline:'center',block:'nearest'});});}});},{rootMargin:'-30% 0px -65% 0px'});[].slice.call(app.querySelectorAll('section')).forEach(function(s){io.observe(s);});}
}
Store.loadPublic().then(render).catch(function(){document.getElementById('status').textContent='تعذر تحميل المنيو، حدّث الصفحة.';});
})();
