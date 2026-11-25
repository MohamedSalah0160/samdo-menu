(function(){
var WA_ICON='<svg viewBox="0 0 24 24" width="16" height="16" fill="currentColor"><path d="M12 2a10 10 0 0 0-8.5 15.2L2 22l4.9-1.4A10 10 0 1 0 12 2zm5.2 13.9c-.2.6-1.3 1.2-1.8 1.2-.5.1-1 .2-3.3-.7-2.8-1.2-4.6-4-4.7-4.2-.1-.2-1.1-1.5-1.1-2.8s.7-2 1-2.3c.2-.3.5-.3.7-.3h.5c.2 0 .4 0 .6.5l.9 2.1c.1.2.1.4 0 .5l-.4.6-.4.4c-.1.2-.3.3-.1.6.2.3.8 1.3 1.7 2.1 1.2 1 2.1 1.3 2.4 1.5.3.1.5.1.6-.1l.8-1c.2-.3.4-.2.6-.1l2 1c.3.1.5.2.5.4.1.2.1.8-.2 1.5z"/></svg>';
function el(t,c,x){var e=document.createElement(t);if(c)e.className=c;if(x!=null)e.textContent=x;return e;}
function fmt(n){return (Math.round(n*100)/100).toString();}
function render(D){
  var app=document.getElementById('app'),nav=document.getElementById('nav');app.innerHTML='';nav.innerHTML='';
  var wa=(D.settings&&D.settings.whatsapp)||'',cur=(D.settings&&D.settings.currency)||'ر.س';
  function link(text){return 'https://wa.me/'+wa+'?text='+encodeURIComponent(text);}
  function ord(text,label){var a=el('a','ord');a.href=link(text);a.target='_blank';a.rel='noopener';a.innerHTML=WA_ICON;a.appendChild(el('span',null,label||'اطلب عبر واتساب'));return a;}
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
          r.appendChild(ord('أطلب: '+i.name+' '+z.n+(z.p!=null&&z.p!==''?' - '+fmt(z.p)+' '+cur:''),'اطلب'));box.appendChild(r);
        });
        li.appendChild(box);
      } else {
        var extra=(c.id==='extras');
        li.appendChild(ord('أطلب: '+i.name+(i.price!=null&&i.price!==''?' - '+fmt(i.price)+' '+cur:''),extra?'اطلب':null));
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
  /*spy*/var links=[].slice.call(nav.children);if('IntersectionObserver' in window){var io=new IntersectionObserver(function(es){es.forEach(function(e){if(e.isIntersecting){links.forEach(function(l){var on=l.getAttribute('href')==='#'+e.target.id;l.classList.toggle('on',on);if(on)l.scrollIntoView({inline:'center',block:'nearest'});});}});},{rootMargin:'-30% 0px -65% 0px'});[].slice.call(app.querySelectorAll('section')).forEach(function(s){io.observe(s);});}
}
Store.loadPublic().then(render).catch(function(){document.getElementById('status').textContent='تعذر تحميل المنيو، حدّث الصفحة.';});
})();
