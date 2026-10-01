(function(){
 'use strict';
 const t=(s,v)=>window.WebRI18n?.t(s,v)||s;
 const el=(tag,text)=>{const n=document.createElement(tag);if(text!=null)n.textContent=text;return n;};
 window.set_main=function(){
  const host=document.getElementById('div_main');if(!host||host.querySelector('[data-paypal-return]'))return;
  const panel=el('section');panel.dataset.paypalReturn='';panel.dataset.webrUi='';panel.style.cssText='width:calc(100% - 32px);max-width:620px;margin:48px auto;padding:28px;border:1px solid #e2e8f0;border-radius:18px;background:white;color:#0f172a;font-family:system-ui,sans-serif;box-shadow:0 8px 30px #0f172a08;';
  const title=el('h1'),message=el('p'),amount=el('p'),reference=el('p'),actions=el('div');title.style.cssText='font-size:24px;margin:0 0 16px;';message.style.cssText='line-height:1.7;';message.setAttribute('role','status');reference.dataset.webrUserContent='';reference.style.cssText='font:12px monospace;overflow-wrap:anywhere;color:#64748b;';amount.dataset.webrUserContent='';amount.style.cssText='font-weight:700;font-size:22px;';actions.style.cssText='display:flex;flex-wrap:wrap;gap:12px;margin-top:22px;';
  panel.append(title,message,amount,reference,actions);host.replaceChildren(panel);
  const params=new URL(location.href).searchParams,localID=params.get('order_id')||'',providerID=params.get('token')||'',canceled=params.get('cancel')==='1';
  const safe=new URL(location.href);safe.searchParams.delete('PayerID');history.replaceState(null,'',safe.pathname+safe.search);
  let busy=false,closed=false,timer=0,tries=0,lastState='checking',lastOrder;
  const labels={checking:['PayPal 결제 확인','결제 상태를 확인하고 있습니다.'],complete:['결제가 완료되었습니다.','회원 권한이 적용되었습니다.'],pending:['결제 처리 중','결제 확인 후 회원 권한이 적용됩니다. 잠시 후 다시 확인해 주세요.'],canceled:['결제가 취소되었습니다.','상품을 다시 선택해 결제를 진행할 수 있습니다.'],failed:['결제 상태를 확인하지 못했습니다.','다시 확인해 주세요. 중복 결제 없이 기존 주문을 확인합니다.'],review:['결제 상태 확인 필요','환불 또는 결제 취소 내역을 확인하고 있습니다.'],login:['로그인이 필요합니다.','결제한 계정으로 로그인해 주세요.']};
  function link(text,href){const a=el('a',t(text));a.href=href;a.style.cssText='display:inline-flex;align-items:center;padding:10px 16px;border-radius:9px;text-decoration:none;background:#eff6ff;color:#1d4ed8;font-weight:600;';return a;}
  function render(state,order){lastState=state;lastOrder=order;const pair=labels[state];title.textContent=t(pair[0]);message.textContent=t(pair[1]);amount.textContent=order?.currency==='USD'?new Intl.NumberFormat(window.WebRI18n?.language||'en',{style:'currency',currency:'USD'}).format(Number(order.amount)):'';reference.textContent=order?.id||'';actions.replaceChildren();
   if(state==='login'){actions.append(link('로그인','/account/?next='+encodeURIComponent(safe.pathname+safe.search)));}
   else if(['pending','failed'].includes(state)){const b=el('button',t('다시 확인'));b.type='button';b.disabled=busy;b.style.cssText='padding:10px 16px;border:0;border-radius:9px;background:#1d4ed8;color:white;font:inherit;font-weight:600;';b.addEventListener('click',()=>check(!canceled&&!!providerID));actions.append(b);}
   actions.append(link(state==='complete'?'내 정보':'정회원 가입',state==='complete'?'/account/myinfo/':'/intro/membership/'));
  }
  async function check(capture=false){if(busy||closed)return;if(!/^[0-9a-f-]{36}$/i.test(localID)){render('failed');return;}
   busy=true;clearTimeout(timer);render('checking',lastOrder);
   try{
    const response=await fetch('/api/paypal/orders/'+encodeURIComponent(localID)+'/'+(capture?'capture/':''),{method:capture?'POST':'GET',credentials:'same-origin',cache:'no-store',headers:capture?{'Content-Type':'application/json'}:{},...(capture?{body:JSON.stringify({provider_order_id:providerID})}:{})});
    if(response.status===401){render('login');return;}
    const payload=await response.json();if(!response.ok||!payload.ok)throw Error('unavailable');
    const order=payload.data;
    if(order.review_required||['REFUNDED','REVERSED'].includes(order.status)){render('review',order);return;}
    if(order.granted){render('complete',order);try{sessionStorage.removeItem('webr-paypal-checkout');}catch(_){}return;}
    if(['VOIDED','DECLINED','DENIED','CANCELED'].includes(order.status)||canceled&&['CREATED','APPROVED','CREATING'].includes(order.status)){render('canceled',order);return;}
    render('pending',order);if(tries++<5)timer=setTimeout(()=>check(false),3000);
   }catch(_){render('failed',lastOrder);}finally{busy=false;const b=actions.querySelector('button');if(b)b.disabled=false;}
  }
  window.addEventListener('webr:language-change',()=>render(lastState,lastOrder));window.addEventListener('pagehide',()=>{closed=true;clearTimeout(timer);},{once:true});
  check(!canceled&&!!providerID);
 };
})();
