(() => {
  'use strict';
  const $ = id => document.getElementById(id);
  const form = $('factsForm');
  let toastTimer;
  function notify(text) { if(!$('toast')) return; $('toast').textContent=text;$('toast').hidden=false;clearTimeout(toastTimer);toastTimer=setTimeout(()=>{$('toast').hidden=true;},4000); }
  const esc = value => String(value).replace(/[&<>"']/g, character=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[character]));
  function facts() {
    if(!form || !form.reportValidity()) return null;
    const values=Object.fromEntries(new FormData(form));
    for(const key of Object.keys(values))values[key]=values[key].trim();
    for(const key of ['name','city','area','hours','services','sources']) {
      if(!values[key]) { $('formError').textContent='请填写完整的真实资料，不能只输入空格。';$('formError').hidden=false;return null; }
    }
    $('formError').hidden=true;
    values.date=new Intl.DateTimeFormat('sv-SE',{timeZone:'Asia/Shanghai',year:'numeric',month:'2-digit',day:'2-digit'}).format(new Date());
    return values;
  }
  function rows(value) { return [['城市',value.city],['地址／服务区域',value.area],['对外营业电话',value.phone||'未提供，请使用已公开经营入口联系'],['营业与接单',value.hours],['服务、价目与条件',value.services],['限制与需确认事项',value.limits||'未补充，请在预约或下单前向经营者确认'],['核实依据',value.sources],['经营者确认日期',value.date]]; }
  function preview(value) {
    $('preview').replaceChildren();
    const title=document.createElement('h3');title.textContent=value.name;
    const hint=document.createElement('p');hint.className='tiny';hint.textContent='商家资料页草稿 · 信息由填写者按真实资料确认';
    const dl=document.createElement('dl');
    for(const [label,text] of rows(value)){const dt=document.createElement('dt');dt.textContent=label;const dd=document.createElement('dd');dd.textContent=text;dl.append(dt,dd);}
    $('preview').append(title,hint,dl);
  }
  function createHtml(value) {
    const details=rows(value).map(([label,text])=>`<section><h2>${esc(label)}</h2><p>${esc(text)}</p></section>`).join('\n');
    const structured=JSON.stringify({'@context':'https://schema.org','@type':'WebPage',name:value.name+' · 商家资料',inLanguage:'zh-CN',dateModified:value.date,description:value.city+'；'+value.area+'；'+value.services.slice(0,180)}).replace(/</g,'\\u003c');
    return `<!doctype html>\n<html lang="zh-CN"><head><meta charset="UTF-8"><meta name="viewport" content="width=device-width,initial-scale=1"><title>${esc(value.name)} · 商家资料</title><meta name="description" content="${esc(value.city+' '+value.name+'的地址、营业与服务资料。信息由填写者按真实资料确认。')}"><style>body{max-width:800px;margin:40px auto;padding:0 24px;background:#f6f7f1;color:#233b39;font:16px/1.9 system-ui,'Microsoft YaHei',sans-serif}h1{font-size:32px;line-height:1.4}h2{font-size:16px;margin:0 0 8px}section{padding:20px 0;border-bottom:1px solid #d5dfd5}p{margin:0;white-space:pre-wrap;overflow-wrap:anywhere}header p,footer{color:#61746c;font-size:13px}footer{margin-top:30px}</style><script type="application/ld+json">${structured}</script></head><body><header><h1>${esc(value.name)}</h1><p>商家资料 · ${esc(value.city)} · 确认日期 ${esc(value.date)}</p></header><main>${details}</main><footer>内容由填写者提供并确认。临时营业、价格与预约条件可能变化，请以经营者最新公开说明为准。页面由“郑州商家事实页生成器 ZGEO-1102”整理；生成工具未对商家资料进行独立核验，也不保证搜索收录或推荐。</footer></body></html>`;
  }
  if(form) {
    form.addEventListener('submit',event=>{event.preventDefault();const value=facts();if(value){preview(value);notify('预览已生成，下载和发布前请再次核对。');}});
    $('downloadPage').addEventListener('click',()=>{const value=facts();if(!value)return;preview(value);const blob=new Blob([createHtml(value)],{type:'text/html;charset=utf-8'});const url=URL.createObjectURL(blob);const link=document.createElement('a');link.href=url;link.download=value.name.replace(/[<>:"/\\|?*\x00-\x1f]/g,'-').slice(0,60)+'-商家资料.html';document.body.append(link);link.click();link.remove();setTimeout(()=>URL.revokeObjectURL(url),2000);notify('已生成 HTML 文件；请核对后另行部署。');});
  }
  for(const button of document.querySelectorAll('[data-copy]'))button.addEventListener('click',async()=>{const target=$(button.dataset.copy);if(!target)return;const text=target.textContent;try{await navigator.clipboard.writeText(text);notify('测试问句已复制。');}catch{const range=document.createRange();range.selectNodeContents(target);const selection=window.getSelection();selection.removeAllRanges();selection.addRange(range);notify('已选中问句，请手动复制。');}});
})();
