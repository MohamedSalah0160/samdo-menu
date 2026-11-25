/* Data layer. Swap this file to move the data to another backend (e.g. a VPS API).
   Public: Store.loadPublic() -> data object. Admin: Store.admin.* (GitHub repo as database). */
(function(){
var REPO='MohamedSalah0160/samdo-menu',BRANCH='main',FILE='data.json';
var Store={repo:REPO};
Store.loadPublic=function(){
  return fetch(FILE+'?t='+Date.now(),{cache:'no-store'}).then(function(r){if(!r.ok)throw new Error('HTTP '+r.status);return r.json();});
};
function api(path,opt,tok){
  opt=opt||{};opt.headers=Object.assign({'Accept':'application/vnd.github+json','Authorization':'Bearer '+tok},opt.headers||{});
  return fetch('https://api.github.com/repos/'+REPO+path,opt).then(function(r){
    return r.json().catch(function(){return{};}).then(function(j){if(!r.ok){var e=new Error(j.message||('HTTP '+r.status));e.status=r.status;throw e;}return j;});
  });
}
function b64utf8(s){return btoa(unescape(encodeURIComponent(s)));}
function utf8b64(b){return decodeURIComponent(escape(atob(b.replace(/\s/g,''))));}
Store.admin={
  check:function(tok){return api('',{},tok).then(function(j){if(!j.permissions||!j.permissions.push)throw new Error('التوكن لا يملك صلاحية الكتابة');return true;});},
  load:function(tok){
    return api('/contents/'+FILE+'?ref='+BRANCH+'&t='+Date.now(),{cache:'no-store'},tok).then(function(j){
      return{data:JSON.parse(utf8b64(j.content)),sha:j.sha};
    });
  },
  uploadImage:function(path,dataUrl,tok){
    var b=dataUrl.split(',')[1];
    return api('/contents/'+path,{method:'GET'},tok).catch(function(){return null;}).then(function(ex){
      var body={message:'admin: photo '+path,content:b,branch:BRANCH};if(ex&&ex.sha)body.sha=ex.sha;
      return api('/contents/'+path,{method:'PUT',body:JSON.stringify(body)},tok);
    });
  },
  save:function(data,sha,tok){
    var body={message:'admin: update menu',content:b64utf8(JSON.stringify(data,null,1)),sha:sha,branch:BRANCH};
    return api('/contents/'+FILE,{method:'PUT',body:JSON.stringify(body)},tok).then(function(j){return j.content.sha;});
  }
};
window.Store=Store;
})();
