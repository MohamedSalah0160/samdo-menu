(function(){
var TOK='samdo_tok',root=document.getElementById('root');
var state={data:null,sha:null,dirty:false,filter:'all',busy:false};
function el(t,c,x){var e=document.createElement(t);if(c)e.className=c;if(x!=null)e.textContent=x;return e;}
function btn(t,c,f){var b=el('button','btn '+(c||''),t);b.type='button';b.onclick=f;return b;}
function lab(t,inp){var l=el('label',null,t);l.appendChild(inp);return l;}
function inp(v,type,ph){var i=el('input');i.type=type||'text';i.value=v==null?'':v;if(ph)i.placeholder=ph;return i;}
function uid(p){return p+Date.now().toString(36)+Math.random().toString(36).slice(2,5);}
function toast(m){var t=el('div','toast',m);document.body.appendChild(t);setTimeout(function(){t.remove();},2600);}
function tok(){return localStorage.getItem(TOK)||'';}
function mark(){state.dirty=true;drawTop();}
function clear(){root.innerHTML='';}

/* ---- login ---- */
function login(){
  clear();var w=el('div','wrap');var b=el('div','box');b.appendChild(el('h3',null,'لوحة تحكم صمدو'));
  var u=inp('', 'text');u.autocomplete='username';var p=inp('','password');p.autocomplete='current-password';
  b.appendChild(lab('اسم المستخدم',u));b.appendChild(lab('كلمة المرور',p));
  var e=el('div','err');
  function go(){if(u.value.trim()==='admin'&&p.value==='admin123'){sessionStorage.setItem('samdo_adm','1');start();}else e.textContent='بيانات الدخول غير صحيحة';}
  p.onkeydown=function(ev){if(ev.key==='Enter')go();};
  var r=el('div','row');r.style.marginTop='14px';r.appendChild(btn('دخول',null,go));b.appendChild(r);b.appendChild(e);w.appendChild(b);root.appendChild(w);
}
/* ---- token setup ---- */
function tokenScreen(msg){
  clear();var w=el('div','wrap');var b=el('div','box');b.appendChild(el('h3',null,'ربط المنيو بالمستودع (مرة واحدة)'));
  var ol=el('ol','steps');
  ['افتح github.com/settings/personal-access-tokens/new','Token name: samdo-admin، والصلاحية Expiration مثلاً سنة','Repository access ← Only select repositories ← اختر samdo-menu فقط','Repository permissions ← Contents: Read and write','اضغط Generate token وانسخه والصقه هنا. يتخزن في هذا المتصفح فقط.'].forEach(function(s){ol.appendChild(el('li',null,s));});
  b.appendChild(ol);var t=inp('','password','github_pat_...');t.dir='ltr';b.appendChild(lab('التوكن',t));
  var e=el('div','err',msg||'');
  var r=el('div','row');r.style.marginTop='12px';
  r.appendChild(btn('حفظ وتحقق',null,function(){var v=t.value.trim();if(!v){e.textContent='الصق التوكن';return;}e.className='hint';e.textContent='جاري التحقق...';
    Store.admin.check(v).then(function(){localStorage.setItem(TOK,v);start();}).catch(function(x){e.className='err';e.textContent='فشل: '+x.message;});}));
  r.appendChild(btn('خروج','sec',logout));b.appendChild(r);b.appendChild(e);w.appendChild(b);root.appendChild(w);
}
function logout(){sessionStorage.removeItem('samdo_adm');login();}
function start(){
  if(sessionStorage.getItem('samdo_adm')!=='1')return login();
  if(!tok())return tokenScreen();
  clear();root.appendChild(el('div','wrap',null)).appendChild(el('p','note big','جاري تحميل البيانات...'));
  Store.admin.load(tok()).then(function(r){state.data=r.data;state.sha=r.sha;state.dirty=false;main();}).catch(function(x){
    if(x.status===401||x.status===403||x.status===404){localStorage.removeItem(TOK);tokenScreen('التوكن غير صالح أو بلا صلاحية: '+x.message);}
    else{clear();var w=el('div','wrap');w.appendChild(el('p','err','تعذر التحميل: '+x.message));w.appendChild(btn('إعادة المحاولة',null,start));root.appendChild(w);}
  });
}
/* ---- main ---- */
var topEl,listEl,catEl;
function drawTop(){
  if(!topEl)return;topEl.innerHTML='';var in_=el('div','in');
  in_.appendChild(el('b',null,'لوحة تحكم صمدو'));
  var r=el('div','row');if(state.dirty)r.appendChild(el('span','dirty','تعديلات غير منشورة'));
  r.appendChild(btn(state.busy?'جاري النشر...':'نشر التعديلات',null,publish));
  var m=btn('⋯','sec sm',function(){var x=confirm('تغيير التوكن؟ (موافق) / تسجيل الخروج؟ (إلغاء)');if(x){localStorage.removeItem(TOK);tokenScreen();}else logout();});r.appendChild(m);
  in_.appendChild(r);topEl.appendChild(in_);
}
function main(){
  clear();topEl=el('div','top');root.appendChild(topEl);drawTop();
  var w=el('div','wrap');
  catEl=el('div','box');listEl=el('div','box');w.appendChild(listEl);w.appendChild(catEl);
  var f=el('p','hint','بعد النشر تظهر التعديلات للزبائن خلال دقيقة تقريباً (GitHub Pages).');w.appendChild(f);
  root.appendChild(w);drawCats();drawItems();
}
function catName(id){var c=state.data.cats.filter(function(x){return x.id===id;})[0];return c?c.name:'';}
function drawItems(){
  listEl.innerHTML='';var h=el('div','row');h.appendChild(el('h3','grow','الأصناف'));
  h.appendChild(btn('+ صنف جديد',null,function(){editItem(null);}));listEl.appendChild(h);
  var sel=el('select');var o=el('option',null,'كل الأقسام');o.value='all';sel.appendChild(o);
  state.data.cats.forEach(function(c){var o=el('option',null,c.name);o.value=c.id;sel.appendChild(o);});sel.value=state.filter;
  sel.onchange=function(){state.filter=sel.value;drawItems();};listEl.appendChild(sel);
  var its=state.data.items.filter(function(i){return state.filter==='all'||i.cat===state.filter;});
  if(!its.length)listEl.appendChild(el('p','hint','لا توجد أصناف.'));
  its.forEach(function(i){
    var c=el('div','card');
    var src=i._pend||i.img;if(src){var im=el('img','th');im.src=src;c.appendChild(im);}
    var m=el('div','meta');m.appendChild(el('b',null,i.name));
    var pr=(i.sizes&&i.sizes.length)?i.sizes.length+' أحجام':(i.price!=null&&i.price!==''?i.price+' ر.س':'بدون سعر');
    m.appendChild(el('small',null,catName(i.cat)+' · '+pr));c.appendChild(m);
    var sw=el('label','sw');sw.style.margin='0';var cb=el('input');cb.type='checkbox';cb.checked=i.avail!==false;
    cb.onchange=function(){i.avail=cb.checked;mark();toast(cb.checked?'متاح':'غير متاح');};sw.appendChild(cb);sw.appendChild(el('span'));sw.title='متاح للزبائن';c.appendChild(sw);
    c.appendChild(btn('تعديل','sec sm',function(){editItem(i);}));
    listEl.appendChild(c);
  });
}
function drawCats(){
  catEl.innerHTML='';var h=el('div','row');h.appendChild(el('h3','grow','الأقسام'));h.appendChild(btn('+ قسم جديد',null,function(){editCat(null);}));catEl.appendChild(h);
  var cs=state.data.cats;
  cs.forEach(function(c,ix){
    var r=el('div','card');var m=el('div','meta');m.appendChild(el('b',null,c.name));
    m.appendChild(el('small',null,state.data.items.filter(function(i){return i.cat===c.id;}).length+' صنف'));r.appendChild(m);
    var up=btn('↑','sec sm',function(){if(ix>0){cs.splice(ix-1,0,cs.splice(ix,1)[0]);mark();drawCats();drawItems();}});
    var dn=btn('↓','sec sm',function(){if(ix<cs.length-1){cs.splice(ix+1,0,cs.splice(ix,1)[0]);mark();drawCats();drawItems();}});
    r.appendChild(up);r.appendChild(dn);r.appendChild(btn('تعديل','sec sm',function(){editCat(c);}));catEl.appendChild(r);
  });
}
function modal(build){
  var m=el('div','modal');var b=el('div','box');m.appendChild(b);build(b,function(){m.remove();});document.body.appendChild(m);return m;
}
function editCat(c){
  modal(function(b,close){
    b.appendChild(el('h3',null,c?'تعديل القسم':'قسم جديد'));
    var n=inp(c&&c.name);var e=inp(c&&c.en,'text','English (اختياري)');e.dir='ltr';
    b.appendChild(lab('اسم القسم',n));b.appendChild(lab('الاسم بالإنجليزي',e));
    var r=el('div','row');r.style.marginTop='14px';
    r.appendChild(btn('حفظ',null,function(){var v=n.value.trim();if(!v){n.focus();return;}
      if(c){c.name=v;c.en=e.value.trim();}else state.data.cats.push({id:uid('c'),name:v,en:e.value.trim()});
      mark();close();drawCats();drawItems();}));
    if(c)r.appendChild(btn('حذف','red',function(){
      var k=state.data.items.filter(function(i){return i.cat===c.id;}).length;
      if(!confirm(k?'سيتم حذف القسم و'+k+' صنف بداخله. متأكد؟':'حذف القسم؟'))return;
      state.data.items=state.data.items.filter(function(i){return i.cat!==c.id;});state.data.cats=state.data.cats.filter(function(x){return x!==c;});
      if(state.filter===c.id)state.filter='all';mark();close();drawCats();drawItems();}));
    r.appendChild(btn('إلغاء','sec',close));b.appendChild(r);
  });
}
function shrink(file,cb){
  var fr=new FileReader();fr.onload=function(){var im=new Image();im.onload=function(){
    var M=700,s=Math.min(1,M/Math.max(im.width,im.height)),cv=document.createElement('canvas');cv.width=Math.round(im.width*s);cv.height=Math.round(im.height*s);
    cv.getContext('2d').drawImage(im,0,0,cv.width,cv.height);cb(cv.toDataURL('image/jpeg',.82));};im.src=fr.result;};fr.readAsDataURL(file);
}
function editItem(it){
  var isNew=!it;
  var d=it?JSON.parse(JSON.stringify(it)):{id:uid('i'),cat:state.filter!=='all'?state.filter:(state.data.cats[0]||{}).id,name:'',desc:'',img:'',price:null,cal:null,sizes:[],avail:true};
  if(it&&it._pend)d._pend=it._pend;
  modal(function(b,close){
    b.appendChild(el('h3',null,isNew?'صنف جديد':'تعديل الصنف'));
    var n=inp(d.name);b.appendChild(lab('الاسم',n));
    var cs=el('select');state.data.cats.forEach(function(c){var o=el('option',null,c.name);o.value=c.id;cs.appendChild(o);});cs.value=d.cat;b.appendChild(lab('القسم',cs));
    var ds=el('textarea');ds.value=d.desc||'';b.appendChild(lab('الوصف (اختياري)',ds));
    var cal=inp(d.cal,'number');b.appendChild(lab('السعرات (اختياري)',cal));
    /* photo */
    var pw=el('div','row');pw.style.marginTop='10px';var pv=el('img','pv');var pvs=function(){var s=d._pend||d.img;pv.style.display=s?'':'none';if(s)pv.src=s;};pvs();pw.appendChild(pv);
    var fi=el('input');fi.type='file';fi.accept='image/*';fi.style.display='none';fi.onchange=function(){if(fi.files[0])shrink(fi.files[0],function(u){d._pend=u;pvs();});};
    pw.appendChild(btn('اختيار صورة','sec sm',function(){fi.click();}));pw.appendChild(fi);
    pw.appendChild(btn('حذف الصورة','red sm',function(){d._pend=null;d.img='';pvs();}));
    b.appendChild(el('label',null,'الصورة'));b.appendChild(pw);
    /* sizes */
    var uni=!(d.sizes&&d.sizes.length);
    var g=el('div');g.style.marginTop='10px';
    var m1=el('label');var r1=el('input');r1.type='radio';r1.name='pm';r1.style.width='auto';r1.checked=uni;m1.appendChild(r1);m1.appendChild(document.createTextNode(' حجم واحد (سعر موحد)'));
    var m2=el('label');var r2=el('input');r2.type='radio';r2.name='pm';r2.style.width='auto';r2.checked=!uni;m2.appendChild(r2);m2.appendChild(document.createTextNode(' عدة أحجام'));
    g.appendChild(m1);g.appendChild(m2);b.appendChild(g);
    var pr=inp(d.price,'number','السعر (اختياري)');pr.step='any';var prl=lab('السعر (ر.س)',pr);b.appendChild(prl);
    var sb=el('div');b.appendChild(sb);
    var rows=(d.sizes&&d.sizes.length)?d.sizes.map(function(z){return{n:z.n,p:z.p};}):[{n:'',p:null}];
    function drawS(){sb.innerHTML='';
      rows.forEach(function(z,ix){var r=el('div','srow');var a=inp(z.n,'text','اسم الحجم (صغير)');a.oninput=function(){z.n=a.value;};
        var p=inp(z.p,'number','السعر');p.step='any';p.style.maxWidth='110px';p.oninput=function(){z.p=p.value===''?null:parseFloat(p.value);};
        r.appendChild(a);r.appendChild(p);r.appendChild(btn('✕','red sm',function(){rows.splice(ix,1);drawS();}));sb.appendChild(r);});
      var add=btn('+ حجم','sec sm',function(){rows.push({n:'',p:null});drawS();});add.style.marginTop='8px';sb.appendChild(add);}
    function mode(){var u=r1.checked;prl.style.display=u?'':'none';sb.style.display=u?'none':'';if(!u)drawS();}
    r1.onchange=r2.onchange=mode;mode();
    var av=el('label');var ac=el('input');ac.type='checkbox';ac.style.width='auto';ac.checked=d.avail!==false;av.appendChild(ac);av.appendChild(document.createTextNode(' متاح للزبائن'));b.appendChild(av);
    var er=el('div','err');b.appendChild(er);
    var r=el('div','row');r.style.marginTop='14px';
    r.appendChild(btn('حفظ',null,function(){
      var name=n.value.trim();if(!name){er.textContent='اكتب اسم الصنف';return;}if(!cs.value){er.textContent='أضف قسماً أولاً';return;}
      d.name=name;d.cat=cs.value;d.desc=ds.value.trim();d.cal=cal.value===''?null:parseInt(cal.value,10);d.avail=ac.checked;
      if(r1.checked){d.price=pr.value===''?null:parseFloat(pr.value);d.sizes=[];}
      else{var z=rows.filter(function(x){return x.n.trim();}).map(function(x){return{n:x.n.trim(),p:x.p};});if(!z.length){er.textContent='أضف حجماً واحداً على الأقل';return;}d.sizes=z;d.price=null;}
      if(isNew)state.data.items.push(d);else{var ix=state.data.items.indexOf(it);state.data.items[ix]=d;}
      mark();close();drawItems();drawCats();}));
    if(!isNew)r.appendChild(btn('حذف','red',function(){if(!confirm('حذف هذا الصنف؟'))return;state.data.items=state.data.items.filter(function(x){return x!==it;});mark();close();drawItems();drawCats();}));
    r.appendChild(btn('إلغاء','sec',close));b.appendChild(r);
  });
}
function publish(){
  if(state.busy)return;if(!state.dirty){toast('لا توجد تعديلات');return;}
  state.busy=true;drawTop();var t=tok();
  var pend=state.data.items.filter(function(i){return i._pend;});
  var chain=Promise.resolve();
  pend.forEach(function(i){chain=chain.then(function(){var p='img/u/'+i.id+'-'+Date.now().toString(36)+'.jpg';return Store.admin.uploadImage(p,i._pend,t).then(function(){i.img=p;delete i._pend;});});});
  chain.then(function(){
    var out=JSON.parse(JSON.stringify(state.data));return Store.admin.save(out,state.sha,t);
  }).then(function(sha){state.sha=sha;state.dirty=false;state.busy=false;drawTop();drawItems();toast('تم النشر ✓ تظهر للزبائن خلال دقيقة');})
  .catch(function(x){state.busy=false;drawTop();
    if(x.status===409||/does not match/i.test(x.message))alert('البيانات اتغيرت من مكان تاني. حدّث الصفحة ثم أعد التعديل.');else alert('فشل النشر: '+x.message);});
}
if(sessionStorage.getItem('samdo_adm')==='1')start();else login();
})();
