const input = document.getElementById('urlInput');
const btn = document.getElementById('goBtn');
const stages = document.querySelectorAll('.stage');
const consoleEl = document.getElementById('console');
const consoleStatus = document.getElementById('consoleStatus');
const consoleBody = document.getElementById('consoleBody');

const ENDPOINT = 'https://api.ikyyxd.my.id/tools/skiplink/sfl?url=';

function resetStages(){ stages.forEach(s => s.classList.remove('active','done')); }

function runStagesAnimation(){
  resetStages();
  let i = 0;
  const timer = setInterval(() => {
    stages.forEach((s, idx) => {
      s.classList.toggle('active', idx === i);
      s.classList.toggle('done', idx < i);
    });
    i++;
    if(i > stages.length){ clearInterval(timer); }
  }, 380);
  return timer;
}

function finishStages(){ stages.forEach(s => { s.classList.remove('active'); s.classList.add('done'); }); }

function showError(message){
  consoleEl.classList.add('show');
  consoleEl.classList.remove('ok');
  consoleStatus.className = 'console-status err';
  consoleStatus.innerHTML = '<span class="sdot"></span> gagal';
  consoleBody.innerHTML = `
    <div class="field">
      <div class="field-k">Pesan sistem</div>
      <div class="field-v" style="color:#ff8a8a;">${message}</div>
    </div>
  `;
}

function showResult(data, runtime){
  consoleEl.classList.add('show', 'ok');
  consoleStatus.className = 'console-status ok';
  consoleStatus.innerHTML = '<span class="sdot"></span> berhasil';

  const original = data.originalUrl || '-';
  const destination = data.destinationUrl || '-';
  const message = data.message || 'Bypass successful';

  consoleBody.innerHTML = `
    <div class="field">
      <div class="field-k">Link tujuan</div>
      <div class="field-v link"><a href="${destination}" target="_blank" rel="noopener noreferrer">${destination}</a><button class="copy-btn" data-copy="${destination.replace(/"/g,'&quot;')}">Copy</button></div>
    </div>
    <div class="field">
      <div class="field-k">Link asal (SFL)</div>
      <div class="field-v">${original}</div>
    </div>
    <div class="row-2">
      <div class="field">
        <div class="field-k">Pesan</div>
        <div class="field-v msg">${message}</div>
      </div>
      <div class="field">
        <div class="field-k">Waktu proses</div>
        <div class="field-v runtime">${runtime || '-'}</div>
      </div>
    </div>
  `;

  const copyBtn = consoleBody.querySelector('.copy-btn');
  if(copyBtn){
    copyBtn.addEventListener('click', () => {
      navigator.clipboard.writeText(copyBtn.dataset.copy).then(() => {
        const original = copyBtn.textContent;
        copyBtn.textContent = 'Copied';
        setTimeout(() => { copyBtn.textContent = original; }, 1400);
      });
    });
  }
}

async function bypass(){
  const raw = input.value.trim();
  if(!raw){
    input.focus();
    input.style.borderColor = '#ff8a8a';
    setTimeout(() => { input.style.borderColor = ''; }, 900);
    return;
  }

  btn.disabled = true;
  btn.classList.add('loading');
  const stageTimer = runStagesAnimation();
  consoleEl.classList.remove('show', 'ok');

  const apiUrl = ENDPOINT + encodeURIComponent(raw);

  try{
    const res = await fetch(apiUrl, { method: 'GET' });
    const json = await res.json();

    clearInterval(stageTimer);
    finishStages();

    if(json && json.status && json.result){
      showResult(json.result, json.runtime);
    } else {
      showError(json && json.message ? json.message : 'Link tidak dapat diproses. Periksa kembali URL SFL kamu.');
    }
  } catch(err){
    clearInterval(stageTimer);
    finishStages();
    showError('Tidak dapat menghubungi server bypass. Coba lagi dalam beberapa saat.');
  } finally {
    btn.disabled = false;
    btn.classList.remove('loading');
  }
}

btn.addEventListener('click', bypass);
input.addEventListener('keydown', (e) => { if(e.key === 'Enter') bypass(); });

document.querySelectorAll('.faq-q').forEach(q => {
  q.addEventListener('click', () => {
    q.parentElement.classList.toggle('open');
  });
});

document.querySelectorAll('.tab-btn').forEach(tabBtn => {
  tabBtn.addEventListener('click', () => {
    const target = tabBtn.dataset.tab;
    document.querySelectorAll('.tab-btn').forEach(b => b.classList.toggle('active', b === tabBtn));
    document.querySelectorAll('.tab-panel').forEach(p => p.classList.toggle('active', p.id === target));
  });
});
