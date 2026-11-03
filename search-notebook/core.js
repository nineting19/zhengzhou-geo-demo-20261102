/* 拾玖搜证台 1.0 · MIT. Independent implementation; see credits.html. */
(function (root, factory) {
  if (typeof module === 'object' && module.exports) module.exports = factory();
  else root.SearchNotebook = factory();
})(typeof globalThis !== 'undefined' ? globalThis : this, function () {
  'use strict';
  const kinds = { name: '名称发现', scene: '需求推荐', url: '网址读取', exclude: '不适用排除' };
  const statuses = { complete: '完整', refusal: '拒答', technical: '技术失败', incomplete: '不完整' };
  const headers = ['run_id','问题id','轮次','平台','入口','日期','联网搜索','登录','地区','是否提到我们','位置','描述是否正确','错误内容','引用来源','备注','批次','问题集版本','事实卡版本','回答状态','排除是否正确','原文路径','来源状态','是否推荐我们','推荐了谁'];
  function uid() { return globalThis.crypto && globalThis.crypto.randomUUID ? globalThis.crypto.randomUUID() : Date.now().toString(36) + '-' + Math.random().toString(36).slice(2); }
  function url(s) { try { const u = new URL(s); return /^https?:$/.test(u.protocol) && !u.username && !u.password ? u.href : null; } catch { return null; } }
  function urls(s) { return [...new Set(String(s || '').split(/\r?\n/).map(s=>s.trim()).filter(Boolean))]; }
  function validate(r) {
    if (!r || typeof r !== 'object' || Array.isArray(r)) throw Error('记录必须为对象');
    const strings = ['id','questionId','kind','question','brand','batch','platform','entry','network','login','region','mode','created','status','answer','sources','factNotes','notes'];
    const booleans = ['fresh','mentioned','identity','facts','sourceVerified','recommended','simulated'];
    const out = {};
    for (const k of strings) { if (typeof r[k] !== 'string' || r[k].length > (k==='answer'?80000:12000)) throw Error('字段无效：'+k); out[k]=r[k]; }
    for (const k of booleans) { if (typeof r[k] !== 'boolean') throw Error('字段无效：'+k); out[k]=r[k]; }
    if (!/^[a-zA-Z0-9-]{1,120}$/.test(out.id) || !out.brand.trim() || !out.question.trim() || !out.batch.trim() || !out.platform.trim() || !out.entry.trim() || !out.mode.trim()) throw Error('编号格式错误，或名称、批次、问题和环境为空');
    if (!kinds[out.kind] || !statuses[out.status] || Number.isNaN(Date.parse(out.created))) throw Error('类型、状态或日期无效');
    if (urls(out.sources).some(s=>!url(s))) throw Error('来源每行一个完整 http(s) 地址；不接受含账号密码的地址');
    return out;
  }
  function protocol(r) {
    const why=[];
    if (r.kind==='name'||r.kind==='scene'||r.kind==='exclude') {
      if (!r.fresh) why.push('未确认全新对话');
      if (/https?:\/\//i.test(r.question)) why.push('独立发现问句给了网址');
      if (r.kind==='scene' && r.question.toLowerCase().includes(r.brand.trim().toLowerCase())) why.push('需求问句包含被测名称');
    }
    return why;
  }
  function outcome(r) {
    const reasons=protocol(r);
    if (!['complete','refusal'].includes(r.status)) reasons.push('回答未完成或技术失败');
    if (!r.answer.trim()) reasons.push('缺少回答原文');
    const eligible=reasons.length===0;
    const factsEnough=r.factNotes.split(/\r?\n/).filter(x=>x.trim()).length>=2;
    const hasSources=urls(r.sources).length>0 && urls(r.sources).every(s=>url(s));
    const evidence=r.identity&&r.facts&&factsEnough&&r.sourceVerified&&hasSources;
    let success=eligible&&r.status==='complete'&&r.mentioned&&evidence;
    if(r.kind==='scene') success=success&&r.recommended;
    if(r.kind==='exclude') success=eligible&&r.status==='complete'&&!r.recommended&&r.facts&&r.factNotes.trim().length>0;
    return {eligible,success,reasons,needsReview:eligible&&r.status==='complete'&&!success};
  }
  function groupKey(r) { return [r.batch,r.brand,r.platform,r.entry,r.mode,r.network,r.login,r.region,r.simulated?'练习':'真实'].join(' / '); }
  function summarize(records) {
    const groups={};
    for (const r of records) {
      const key=groupKey(r);
      const g=groups[key]||(groups[key]={key,simulated:r.simulated,types:{}});
      const t=g.types[r.kind]||(g.types[r.kind]={total:0,valid:0,success:0,excluded:0});
      t.total++; const o=outcome(r); if(o.eligible) {t.valid++;if(o.success)t.success++;}else t.excluded++;
    }
    return Object.values(groups);
  }
  function csvCell(v) {
    let s=String(v==null?'':v);
    if(/^[\s]*[=+@-]/.test(s)||/^[\t\r]/.test(s))s="'"+s;
    return '"'+s.replace(/"/g,'""')+'"';
  }
  function csv(records) {
    const rounds=new Map();
    return '\uFEFF'+[headers,...records.map(r=>{
      const eligible=outcome(r).eligible,valid=['complete','refusal'].includes(r.status),roundKey=groupKey(r)+'/'+r.questionId;
      const round=(rounds.get(roundKey)||0)+1;rounds.set(roundKey,round);
      return [r.id,r.questionId,round,r.platform,r.entry,r.created,r.network,r.login,r.region,valid?(r.mentioned?'是':'否'):'未知','未知',valid&&r.identity&&r.facts?'对':'未知','',urls(r.sources).join(';'),`${kinds[r.kind]}；${r.simulated?'模拟练习':'真实手动采样'}；${outcome(r).reasons.join('；')}；人工来源核对=${r.sourceVerified}；${r.notes}`,`${groupKey(r)} / ${kinds[r.kind]}`,'q1','f1',valid&&!eligible?'不完整':statuses[r.status],r.kind==='exclude'?(outcome(r).success?'对':'未知'):'不适用',`raw/${r.id}.md`,urls(r.sources).length?'已提供':valid?'界面无来源':'未知',valid?(r.recommended?'推荐':'不推荐'):'未知',r.recommended?r.brand:''];
    })].map(row=>row.map(csvCell).join(',')).join('\r\n');
  }
  function exportJSON(records) { return JSON.stringify({schemaVersion:1,exportedAt:new Date().toISOString(),records},null,2); }
  function parseImport(text, existing=[]) {
    if(text.length>3000000)throw Error('文件不能超过 3 MB');
    let data;try{data=JSON.parse(text);}catch{throw Error('JSON 格式错误');}
    if(!data||data.schemaVersion!==1||!Array.isArray(data.records)||data.records.length>2000)throw Error('需要 schemaVersion=1 的记录文件，最多 2000 条');
    const seen=new Set(existing.map(r=>r.id));const records=[];let duplicates=0;
    for(const item of data.records) {const r=validate(item);if(seen.has(r.id)){duplicates++;continue;}seen.add(r.id);records.push(r);}
    if(existing.length+records.length>2000)throw Error('合并后超过 2000 条，请先导出备份');
    return {records,duplicates};
  }
  function report(records) {
    const out=['# 拾玖搜证台 · 采样报告','','统计为人工复核标记，不代表平台官方测评。网址读取不计入名称发现或需求推荐。原始 JSON 才是完整可回导备份。',''];
    if(!records.length)out.push('尚无采样记录。');
    for(const g of summarize(records)) {
      out.push('## '+g.key,'',g.simulated?'**模拟练习数据，不是豆包实际结果。**':'人工记录，仍应逐条核对来源。','');
      for(const [kind,t]of Object.entries(g.types))out.push(`${kinds[kind]}：${t.valid?`${t.success}/${t.valid}（${Math.round(100*t.success/t.valid)}%）`:'未采样'}；排除 ${t.excluded} 条。`);
      out.push('');
    }
    for(const r of records)out.push('## '+r.id,`类型：${kinds[r.kind]} / ${r.simulated?'模拟':'真实'} / ${statuses[r.status]}`,`问句：${r.question}`,`结果：${outcome(r).success?'人工判定达标':'未达标或待核对'}`,`核对事实：\n${r.factNotes}`,`来源：\n${r.sources}`,'','回答原文：','',r.answer,'');
    return out.join('\n');
  }
  return {kinds,statuses,headers,uid,url,urls,validate,protocol,outcome,summarize,csv,exportJSON,parseImport,report};
});
