(function(){
  'use strict';
  const C=window.SearchNotebook,$=id=>document.getElementById(id),KEY='shijiu-search-notebook-v1';
  let real=[],practice=[],simulated=false,filter='all',imported=null,storageBroken=false;
  function toast(s){$('toast').textContent=s;$('toast').classList.remove('hidden');clearTimeout(toast.timer);toast.timer=setTimeout(()=>$('toast').classList.add('hidden'),4500);}
  function readStorage(){try{const s=localStorage.getItem(KEY);if(s)real=C.parseImport(s).records.filter(r=>!r.simulated);}catch(e){storageBroken=true;$('storage-warning').textContent='本机历史数据未载入：'+e.message+'。已停止覆盖存储；“导出 JSON”可备份原始数据。';$('save').disabled=true;}}
  function persist(next){if(storageBroken){toast('原始数据异常，已阻止覆盖；请先用“导出 JSON”备份。');return false;}try{localStorage.setItem(KEY,C.exportJSON(next));real=next;return true;}catch{toast('浏览器存储失败。请先导出 JSON 备份，再检查空间或隐私模式。');return false;}}
  function current(){return simulated?practice:real;}
  function selected(){return current().filter(r=>filter==='all'||C.summarize([r])[0].key===filter);}
  function text(tag,value,cls){const e=document.createElement(tag);e.textContent=value;if(cls)e.className=cls;return e;}
  function updateQuestion(){const q=window.NOTEBOOK_QUESTIONS.find(q=>q.id===$('question-id').value);if(q){$('kind').value=q.kind;$('question').value=q.text.replaceAll('拾玖搜证台',$('brand').value.trim()||'拾玖搜证台');$('question-hint').textContent=q.hint;}}
  function render(){
    $('mode-label').textContent=simulated?'练习模式 · 所有数据均为模拟':'真实采样 · 数据仅存在当前浏览器';
    $('mode-banner').classList.toggle('warning',simulated);
    $('toggle-practice').textContent=simulated?'返回真实采样':'试用模拟练习';
    const groups=C.summarize(current());const sel=$('batch-filter');sel.replaceChildren(new Option('全部批次（分组展示，不合并分母）','all'));for(const g of groups)sel.add(new Option(g.key,g.key));if([...sel.options].some(o=>o.value===filter))sel.value=filter;else filter='all';
    const rows=selected(),container=$('metrics');container.replaceChildren();
    const gs=C.summarize(rows);
    if(!gs.length){const m=document.createElement('div');m.className='metric';for(const label of ['名称发现','需求推荐','网址读取']){const el=document.createElement('div');el.append(text('small',label),text('strong','未采样'),text('small','有效样本 0 条'));m.append(el);}container.append(m);}
    for(const g of gs){const box=text('section','','kpi-group');box.append(text('h3',g.key));const m=text('div','','metric');for(const kind of ['name','scene','url']){const t=g.types[kind]||{valid:0,success:0,excluded:0};const el=text('div','');el.append(text('small',C.kinds[kind]),text('strong',t.valid?`${t.success}/${t.valid}`:'未采样'),text('small',`${t.valid?Math.round(t.success/t.valid*100)+'% · ':''}排除 ${t.excluded} 条`));m.append(el);}box.append(m);if(g.types.exclude){const t=g.types.exclude;box.append(text('p',`不适用排除：${t.success}/${t.valid}；排除 ${t.excluded} 条`,'tiny'));}container.append(box);}
    $('count').textContent=`${rows.length} 条记录`;$('record-list').replaceChildren();
    if(!rows.length)$('record-list').append(text('p','还没有回答原文。复制一条问句，在豆包全新对话中测试，再回来记录。','empty'));
    for(const r of [...rows].reverse()){
      const o=C.outcome(r),d=text('details','','record');d.append(text('summary',`${r.simulated?'[模拟] ':''}${C.kinds[r.kind]} · ${o.success?'人工判定达标':o.eligible?'未达标 / 待核对':'不计入分母'} · ${r.question}`));
      d.append(text('p',`${new Date(r.created).toLocaleString()} / ${r.platform} / ${r.entry} / ${r.batch}`,'tiny'));
      if(o.reasons.length)d.append(text('p',o.reasons.join('；'),'statusline'));
      d.append(text('pre',r.answer),text('p',`核对事实：${r.factNotes||'尚未记录'}`,'tiny'));
      for(const s of C.urls(r.sources)){const a=document.createElement('a');a.href=C.url(s);a.textContent=s;a.target='_blank';a.rel='noopener noreferrer';d.append(a,document.createElement('br'));}
      const del=text('button','删除此条','secondary');del.type='button';del.onclick=()=>{if(!confirm('删除这条本机记录？建议先导出 JSON 备份。'))return;const next=current().filter(x=>x.id!==r.id);if(simulated)practice=next;else if(!persist(next))return;render();};d.append(del);$('record-list').append(d);
    }
  }
  function download(name,content,type){const u=URL.createObjectURL(new Blob([content],{type}));const a=document.createElement('a');a.href=u;a.download=name;document.body.append(a);a.click();a.remove();setTimeout(()=>URL.revokeObjectURL(u),1500);}
  function collect(){return C.validate({id:C.uid(),questionId:$('question-id').value,kind:$('kind').value,question:$('question').value.trim(),brand:$('brand').value.trim(),batch:$('batch').value.trim(),platform:$('platform').value.trim(),entry:$('entry').value,network:$('network').value,login:$('login').value,region:$('region').value.trim()||'未知',mode:$('mode').value.trim()||'未知',created:new Date().toISOString(),status:$('status').value,answer:$('answer').value,sources:$('sources').value,factNotes:$('fact-notes').value,notes:$('notes').value,fresh:$('fresh').checked,mentioned:$('mentioned').checked,identity:$('identity').checked,facts:$('facts').checked,sourceVerified:$('source-verified').checked,recommended:$('recommended').checked,simulated});}
  $('record-form').addEventListener('submit',e=>{e.preventDefault();try{const r=collect();if(current().length>=2000)throw Error('当前记录已达 2000 条，请先导出');if(!r.answer.trim())throw Error('请保存回答原文；遇到技术失败时写明具体错误');const next=[...current(),r];if(simulated)practice=next;else if(!persist(next))return;for(const id of ['answer','sources','fact-notes','notes'])$(id).value='';for(const id of ['mentioned','identity','facts','source-verified','recommended'])$(id).checked=false;filter='all';render();toast('记录已保存。'+(C.outcome(r).success?'标记为人工判定达标，请保留原始截图。':'尚未达标或待核对，不会自动当作命中。'));}catch(e){toast(e.message);}});
  $('question-id').onchange=updateQuestion;$('brand').onchange=updateQuestion;
  $('copy').onclick=async()=>{try{await navigator.clipboard.writeText($('question').value);toast('已复制问句，请在全新对话中提问。');}catch{$('question').focus();$('question').select();toast('当前环境无法自动复制；问句已选中，请手动复制。');}};
  $('batch-filter').onchange=e=>{filter=e.target.value;render();};
  $('toggle-practice').onclick=()=>{simulated=!simulated;filter='all';if(simulated&&!practice.length){const base={id:C.uid(),questionId:'N01',kind:'name',question:'请搜索拾玖搜证台，说明它是什么，有哪些功能，并给出来源。',brand:'拾玖搜证台',batch:'模拟练习',platform:'模拟平台',entry:'练习',network:'未知',login:'未知',region:'练习',mode:'模拟',created:new Date().toISOString(),status:'complete',answer:'【模拟回答，不是豆包实测】拾玖搜证台是一款浏览器本地记录工具，可以保存搜索回答、导出 JSON；名称搜索和需求推荐分开统计。此处仅演示如何记录。',sources:'https://example.com/demo-only',factNotes:'【模拟】记录留在浏览器本地\n【模拟】可导出 JSON',notes:'模拟数据不作公开成效证据',fresh:true,mentioned:true,identity:true,facts:true,sourceVerified:false,recommended:false,simulated:true};practice=[base];}render();toast(simulated?'已进入独立练习区；模拟记录不会写入真实历史。':'已返回真实采样。');};
  const toggleMode=$('toggle-practice').onclick;
  $('toggle-practice').onclick=()=>{imported=null;$('import-box').classList.add('hidden');for(const id of ['answer','sources','fact-notes','notes'])$(id).value='';for(const id of ['fresh','mentioned','identity','facts','source-verified','recommended'])$(id).checked=false;toggleMode();};
  for(const [id,extension,type,fn] of [['export-json','json','application/json',C.exportJSON],['export-csv','csv','text/csv;charset=utf-8',C.csv],['export-report','md','text/markdown;charset=utf-8',C.report]])$(id).onclick=()=>{if(id==='export-json'&&storageBroken&&!simulated){try{download('原始存储备份-请检查.json',localStorage.getItem(KEY)||'','application/json');}catch{toast('浏览器无法读取本地存储。');}return;}download(`${simulated?'模拟练习-':'真实采样-'}拾玖搜证台-${new Date().toISOString().slice(0,10)}.${extension}`,fn(selected()),type);};
  $('export-bundle').onclick=()=>{const rows=selected();const files={'runs.csv':C.csv(rows),'README.md':'# GEO 医生导入包\n\nruns.csv 与原文 JSON 同批次导出。raw/*.md 路径保存在 records.json 的 rawFiles 中。将对应文本另存为文件后可供 GEO 医生读取；此 JSON 不是 runs.csv 替代品。\n','report.md':C.report(rows)};for(const r of rows)files[`raw/${r.id}.md`]=`# ${r.id}\n\n${r.simulated?'【模拟练习】\n':''}问题：${r.question}\n\n${r.answer}\n\n来源：\n${r.sources}\n`;download('GEO医生-文件清单与原文.json',JSON.stringify({schemaVersion:1,records:rows,rawFiles:files},null,2),'application/json');toast('已导出文件清单；具体拆包方法见使用指南。');};
  $('import-json').onchange=async e=>{const f=e.target.files[0];e.target.value='';if(!f)return;try{if(f.size>3000000)throw Error('文件不能超过 3 MB');const result=C.parseImport(await f.text(),current());if(result.records.some(r=>r.simulated!==simulated))throw Error('真实采样与模拟练习不能混合导入，请切换对应模式');imported=result;$('import-info').textContent=`准备合并 ${result.records.length} 条，跳过 ${result.duplicates} 条重复记录。不会覆盖已有记录。`;$('import-box').classList.remove('hidden');}catch(e){toast(e.message);}};
  $('confirm-import').onclick=()=>{if(!imported)return;const next=[...current(),...imported.records];if(simulated)practice=next;else if(!persist(next))return;imported=null;$('import-box').classList.add('hidden');filter='all';render();toast('导入完成');};$('cancel-import').onclick=()=>{imported=null;$('import-box').classList.add('hidden');};
  for(const q of window.NOTEBOOK_QUESTIONS)$('question-id').add(new Option(`${q.id} · ${C.kinds[q.kind]} · ${q.short}`,q.id));
  $('batch').value='基线-'+new Date().toLocaleDateString('sv-SE');readStorage();updateQuestion();render();
})();
