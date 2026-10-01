(function(){
 'use strict';
 const t=s=>window.WebRI18n?.t(s)||s;
 const label=(node,source)=>{node.dataset.paymentLabel=source;node.textContent=t(source);};
 window.addEventListener('webr:language-change',()=>{document.querySelectorAll('#paypal-admin-orders [data-payment-label]').forEach(node=>{node.textContent=t(node.dataset.paymentLabel);});});
 async function mount(){
  const main=document.getElementById('div_main');if(!main||document.getElementById('paypal-admin-orders'))return;
  const panel=document.createElement('section');panel.id='paypal-admin-orders';panel.dataset.webrUi='';panel.style.cssText='margin:28px 0;padding:20px;border:1px solid #dbeafe;border-radius:12px;background:#fff;max-width:100%;';
  const heading=document.createElement('h2');heading.textContent='PayPal · USD';const note=document.createElement('p');label(note,'PayPal 결제는 USD로 별도 집계합니다.');const action=document.createElement('button');action.type='button';label(action,'결제 내역 불러오기');const output=document.createElement('div');output.style.overflowX='auto';panel.append(heading,note,action,output);main.append(panel);
  let before='',busy=false;
  action.addEventListener('click',async()=>{if(busy)return;busy=true;action.disabled=true;
   try{const r=await fetch('/api/paypal/admin/orders/?before='+encodeURIComponent(before),{credentials:'same-origin',cache:'no-store'});const payload=await r.json();if(!r.ok||!payload.ok)throw Error();
    const table=document.createElement('table');table.style.cssText='width:100%;font:13px system-ui;border-collapse:collapse;margin:12px 0;';const head=table.createTHead().insertRow();['주문 번호','계정','상품','수량','USD','결제 상태','확인 필요'].forEach(text=>{const th=document.createElement('th');label(th,text);th.style.cssText='text-align:start;padding:10px;border-bottom:1px solid #e2e8f0;';head.append(th);});
    for(const row of payload.data){const tr=table.insertRow();for(const [index,value] of [row.id,row.owner_id||'—',row.product_id,row.quantity,row.amount+' USD',row.status,row.review_required?t('확인 필요'):'—'].entries()){const td=tr.insertCell();td.textContent=value;td.dataset.webrUserContent='';if(index===6&&row.review_required)label(td,'확인 필요');td.style.cssText='padding:10px;border-bottom:1px solid #e2e8f0;overflow-wrap:anywhere;';}}
    output.append(table);before=payload.data.at(-1)?.id||'';action.hidden=payload.data.length<50;label(action,'더 보기');
   }catch(_){const p=document.createElement('p');p.setAttribute('role','status');label(p,'결제 내역을 불러오지 못했습니다.');output.replaceChildren(p);}finally{busy=false;action.disabled=false;}
  });
 }
 if(document.readyState==='loading')document.addEventListener('DOMContentLoaded',mount,{once:true});else mount();
 new MutationObserver(()=>{if(!document.getElementById('paypal-admin-orders'))mount();}).observe(document.body,{childList:true,subtree:true});
})();
