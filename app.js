async function loadData(){
  const res = await fetch('./data.json', { cache: 'no-store' });
  if(!res.ok) throw new Error('data.json 加载失败');
  return await res.json();
}

function uniq(arr){
  return Array.from(new Set(arr.map(x=>String(x||'').trim()).filter(Boolean)));
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

function renderDatalist(datalist, values){
  datalist.innerHTML='';
  for(const v of values){
    datalist.appendChild(el('option',{value:v}));
  }
}

function norm(s){
  return String(s||'').trim();
}

function filterItems(data, prov, city){
  prov = norm(prov);
  city = norm(city);
  return data.filter(it => {
    if(prov && norm(it.province) !== prov) return false;
    if(city && norm(it.city) !== city) return false;
    return true;
  });
}

function copyText(t){
  navigator.clipboard?.writeText(t).catch(()=>{
    const ta = document.createElement('textarea');
    ta.value=t; document.body.appendChild(ta);
    ta.select(); document.execCommand('copy');
    ta.remove();
  });
}

function renderResults(list){
  const root = document.querySelector('#results');
  root.innerHTML='';

  if(!list.length){
    root.appendChild(el('div',{class:'card'},[el('div',{text:'未查询到匹配结果，请检查省份/城市是否正确。'})]));
    return;
  }

  for(const it of list){
    const phones = (it.phones||[]).map(p => {
      const a = el('a',{href:`tel:${p}`,text:p});
      const copyBtn = el('button',{class:'copy',type:'button',text:'复制',onclick:()=>copyText(p)});
      return el('span',{class:'phone'},[a,copyBtn]);
    });

    root.appendChild(
      el('div',{class:'card'},[
        el('h3',{text:`${it.province} · ${it.city}${it.region ? `（${it.region}）` : ''}`}),
        el('div',{class:'phones'}, phones)
      ])
    );
  }
}

function setHint(text){
  document.querySelector('#count').textContent = text || '';
}

(async function main(){
  const data = await loadData();

  const provinceInput = document.querySelector('#province');
  const cityInput = document.querySelector('#city');
  const provinceList = document.querySelector('#provinceList');
  const cityList = document.querySelector('#cityList');
  const searchBtn = document.querySelector('#search');
  const resetBtn = document.querySelector('#reset');

  const provinces = uniq(data.map(x=>x.province)).sort((a,b)=>a.localeCompare(b,'zh'));
  renderDatalist(provinceList, provinces);

  function refreshCities(){
    const prov = norm(provinceInput.value);
    const cities = uniq(data.filter(x=>!prov || norm(x.province)===prov).map(x=>x.city))
      .sort((a,b)=>a.localeCompare(b,'zh'));
    renderDatalist(cityList, cities);
  }

  function runSearch(){
    const prov = provinceInput.value;
    const city = cityInput.value;

    if(!norm(prov) && !norm(city)){
      setHint('请输入省份或城市后再查询');
      renderResults([]);
      return;
    }

    const list = filterItems(data, prov, city);
    setHint(`匹配结果：${list.length} 条`);
    renderResults(list);
  }

  provinceInput.addEventListener('input', ()=>{ refreshCities(); });
  provinceInput.addEventListener('change', ()=>{ refreshCities(); });

  searchBtn.addEventListener('click', runSearch);
  resetBtn.addEventListener('click', ()=>{
    provinceInput.value='';
    cityInput.value='';
    refreshCities();
    setHint('');
    document.querySelector('#results').innerHTML='';
  });

  // Enter to search
  provinceInput.addEventListener('keydown', (e)=>{ if(e.key==='Enter') runSearch(); });
  cityInput.addEventListener('keydown', (e)=>{ if(e.key==='Enter') runSearch(); });

  refreshCities();
})();
