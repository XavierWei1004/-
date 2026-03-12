async function loadData(){
  const res = await fetch('./data.json', { cache: 'no-store' });
  if(!res.ok) throw new Error('data.json 加载失败');
  return await res.json();
}

function uniq(arr){
  return Array.from(new Set(arr.filter(Boolean)));
}

function el(tag, attrs={}, children=[]){
  const e = document.createElement(tag);
  for(const [k,v] of Object.entries(attrs)){
    if(k==='class') e.className=v;
    else if(k==='text') e.textContent=v;
    else if(k.startsWith('on') && typeof v==='function') e.addEventListener(k.slice(2), v);
    else e.setAttribute(k,v);
  }
  for(const c of children) e.appendChild(c);
  return e;
}

function renderOptions(select, values, placeholder){
  select.innerHTML='';
  select.appendChild(el('option',{value:'',text:placeholder}));
  for(const v of values){
    select.appendChild(el('option',{value:v,text:v}));
  }
}

function matchItem(item, q){
  if(!q) return true;
  q = q.trim();
  if(!q) return true;
  const s = `${item.region} ${item.province} ${item.city} ${(item.phones||[]).join(' ')}`;
  return s.toLowerCase().includes(q.toLowerCase());
}

function filterItems(data, prov, city, q){
  return data.filter(it => {
    if(prov && it.province !== prov) return false;
    if(city && it.city !== city) return false;
    if(!matchItem(it,q)) return false;
    return true;
  });
}

function copyText(t){
  navigator.clipboard?.writeText(t).then(()=>{
    // ok
  }).catch(()=>{
    const ta = document.createElement('textarea');
    ta.value=t; document.body.appendChild(ta);
    ta.select(); document.execCommand('copy');
    ta.remove();
  });
}

function renderResults(list){
  const root = document.querySelector('#results');
  root.innerHTML='';
  for(const it of list){
    const phones = (it.phones||[]).map(p => {
      const a = el('a',{href:`tel:${p}`,text:p});
      const copyBtn = el('button',{class:'copy',type:'button',text:'复制',onclick:()=>copyText(p)});
      return el('span',{class:'phone'},[a,copyBtn]);
    });

    root.appendChild(
      el('div',{class:'card'},[
        el('div',{class:'title'},[
          el('h3',{text:`${it.province} · ${it.city}`}),
          el('span',{class:'badge',text: it.region ? `大区：${it.region}` : ''}),
        ]),
        el('div',{class:'phones'}, phones)
      ])
    );
  }
}

function setCount(n){
  document.querySelector('#count').textContent = `匹配结果：${n} 条`;
}

(async function main(){
  const data = await loadData();

  const provinceSel = document.querySelector('#province');
  const citySel = document.querySelector('#city');
  const qInput = document.querySelector('#q');
  const resetBtn = document.querySelector('#reset');

  const provinces = uniq(data.map(x=>x.province)).sort((a,b)=>a.localeCompare(b,'zh'));
  renderOptions(provinceSel, provinces, '全部省份');
  renderOptions(citySel, [], '全部城市');

  function refreshCities(){
    const prov = provinceSel.value;
    const cities = uniq(data.filter(x=>!prov || x.province===prov).map(x=>x.city))
      .sort((a,b)=>a.localeCompare(b,'zh'));
    const cur = citySel.value;
    renderOptions(citySel, cities, '全部城市');
    if(cities.includes(cur)) citySel.value = cur;
  }

  function refresh(){
    const prov = provinceSel.value;
    const city = citySel.value;
    const q = qInput.value;
    const list = filterItems(data, prov, city, q);
    renderResults(list);
    setCount(list.length);
  }

  provinceSel.addEventListener('change', ()=>{ refreshCities(); refresh(); });
  citySel.addEventListener('change', refresh);
  qInput.addEventListener('input', refresh);
  resetBtn.addEventListener('click', ()=>{
    provinceSel.value='';
    qInput.value='';
    refreshCities();
    citySel.value='';
    refresh();
  });

  refreshCities();
  refresh();
})();
