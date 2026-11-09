'use strict';
document.documentElement.classList.add('js');
const reduced = matchMedia('(prefers-reduced-motion: reduce)').matches;
const observer = new IntersectionObserver(entries => entries.forEach(e => { if(e.isIntersecting){e.target.classList.add('visible');observer.unobserve(e.target);}}), {threshold:.08});
document.querySelectorAll('.reveal').forEach(el=>observer.observe(el));
const $=id=>document.getElementById(id);
const wave=$('wave-canvas'), hero=$('hero-canvas');
let bank=null,emotion=0,sample=0,position=0,playing=false,lastTime=0,heroPhase=0,loading=false;
const colors=['#bba4f0','#8faee1','#9ad4c8','#c6b6e9','#92b6d0','#b5cfb7'];
function fit(canvas){let r=canvas.getBoundingClientRect(),d=Math.min(devicePixelRatio||1,2);if(canvas.width!==Math.round(r.width*d)||canvas.height!==Math.round(r.height*d)){canvas.width=Math.round(r.width*d);canvas.height=Math.round(r.height*d);}let c=canvas.getContext('2d');c.setTransform(d,0,0,d,0,0);return [c,r.width,r.height];}
function current(){return bank.examples.find(x=>x.label===emotion&&x.index===sample);}
function drawWave(){if(!bank)return;let [c,w,h]=fit(wave),ex=current(),left=44,right=w-12,top=16,bottom=h-24,lane=(bottom-top)/6;if(!ex||w<80||h<80)return;
 c.clearRect(0,0,w,h);c.font='10px ui-monospace, monospace';c.textBaseline='middle';
 for(let i=0;i<=10;i++){let x=left+(right-left)*i/10;c.strokeStyle='#2d3548';c.lineWidth=.6;c.beginPath();c.moveTo(x,top-4);c.lineTo(x,bottom);c.stroke();if(i%2===0){c.fillStyle='#8d99b1';c.textAlign='center';c.fillText(i+'s',x,h-8);}}
 for(let k=0;k<6;k++){let y=top+lane*(k+.5);c.textAlign='left';c.fillStyle='#a6b2c9';c.fillText(bank.channels[k],0,y);c.strokeStyle='#30384b';c.lineWidth=.5;c.beginPath();c.moveTo(left,y);c.lineTo(right,y);c.stroke();let arr=ex.channels[k];
 const trace=()=>{c.beginPath();for(let j=0;j<arr.length;j++){let x=left+(right-left)*j/(arr.length-1),v=y-arr[j]/Math.max(ex.scale,1e-6)*lane*.30;j?c.lineTo(x,v):c.moveTo(x,v);}};
 c.save();c.beginPath();c.rect(left,top+k*lane,right-left,lane);c.clip();c.strokeStyle=colors[k];c.globalAlpha=.27;c.lineWidth=1.1;trace();c.stroke();c.beginPath();c.rect(left,top+k*lane,(right-left)*position/10,lane);c.clip();c.globalAlpha=1;c.shadowColor=colors[k];c.shadowBlur=1;trace();c.stroke();c.restore();}
 let scan=left+(right-left)*position/10;c.strokeStyle='#d8c9ff';c.lineWidth=1;c.beginPath();c.moveTo(scan,top-5);c.lineTo(scan,bottom);c.stroke();let grad=c.createLinearGradient(Math.max(left,scan-24),0,scan,0);grad.addColorStop(0,'#c4b1ff00');grad.addColorStop(1,'#c4b1ff18');c.fillStyle=grad;c.fillRect(Math.max(left,scan-24),top,Math.min(24,scan-left),bottom-top);
 $('time-label').textContent=position.toFixed(1)+' / 10.0 s';$('timeline').value=position;$('timeline').style.setProperty('--progress',`${position*10}%`);$('timeline').setAttribute('aria-valuetext',`${position.toFixed(1)} seconds of 10 seconds`);$('scale-label').textContent='Display scale '+ex.scale.toFixed(1)+' µV';$('scale-label').title='Each sample uses its original 98th-percentile absolute amplitude for display scaling. Data values are unchanged.';
}
function drawHero(){let[c,w,h]=fit(hero);c.clearRect(0,0,w,h);for(let j=0;j<4;j++){c.beginPath();for(let i=0;i<=w;i+=2){let t=i/w,env=Math.sin(Math.PI*t)**2;let y=h*.49+j*5+env*(Math.sin(i*.035-heroPhase+j*.3)*9+Math.sin(i*.12-heroPhase*1.7+j)*5+Math.sin(i*.21+heroPhase)*2);i?c.lineTo(i,y):c.moveTo(i,y);}c.strokeStyle=['#b4a4e1','#9eabd4','#a5c9c0','#cdc0dd'][j];c.lineWidth=1.1;c.globalAlpha=.65;c.stroke();}c.globalAlpha=1;}
function setPlaying(value){playing=Boolean(value&&bank);$('play-button').textContent=playing?'Ⅱ':'▶';$('play-button').setAttribute('aria-label',playing?'Pause waveform animation':'Play waveform animation');$('play-button').setAttribute('aria-pressed',String(playing));wave.closest('.explorer').classList.toggle('is-playing',playing);}
function selectSample(){position=reduced?10:0;setPlaying(!reduced);$('emotion-name').textContent=bank.classes[emotion];document.querySelectorAll('[data-emotion]').forEach(b=>b.setAttribute('aria-pressed',Number(b.dataset.emotion)===emotion));wave.setAttribute('aria-label',`Six channels of generated ${bank.classes[emotion]} EEG, sample ${sample+1}, ten seconds, microvolts`);drawWave();}
$('play-button').onclick=()=>{if(!bank)return;if(position>=10)position=0;setPlaying(!playing);drawWave();};
$('replay-button').onclick=()=>{if(!bank)return;position=0;setPlaying(true);drawWave();};
$('timeline').oninput=e=>{if(!bank)return;setPlaying(false);position=Math.max(0,Math.min(bank.duration,Number(e.target.value)||0));drawWave();};
$('sample-select').onchange=e=>{sample=Number(e.target.value);if(bank)selectSample();};
$('download-sample').onclick=()=>{if(!bank)return;let ex=current(),blob=new Blob([JSON.stringify({model:'EEGMeanFlow',emotion:ex.name,sample:ex.index+1,sampleRate:bank.sampleRate,duration:bank.duration,unit:bank.unit,channelNames:bank.channels,channels:ex.channels})],{type:'application/json'}),url=URL.createObjectURL(blob),a=document.createElement('a');a.href=url;a.download=`EEGMeanFlow-${ex.name}-${ex.index+1}.json`;document.body.append(a);a.click();a.remove();setTimeout(()=>URL.revokeObjectURL(url),2000);};

function setControlsEnabled(enabled) {
  ['play-button','replay-button','timeline','sample-select','download-sample'].forEach(id=>{$(id).disabled=!enabled;});
}

function validateSamples(data) {
  if (!data || !Array.isArray(data.classes) || data.classes.length!==9 || !Array.isArray(data.examples) || data.examples.length!==27) {
    throw new Error('The sample bank must contain nine classes and 27 recorded examples.');
  }
  if (!Array.isArray(data.channels) || data.channels.length!==6 || data.sampleRate!==100 || data.duration!==10) {
    throw new Error('The sample bank has an unsupported recording layout.');
  }
  const found=new Set();
  data.examples.forEach(example=>{
    const key=`${example.label}:${example.index}`;
    if (!Number.isInteger(example.label) || example.label<0 || example.label>=data.classes.length || !Number.isInteger(example.index) || example.index<0 || example.index>2 || found.has(key) || example.name!==data.classes[example.label]) {
      throw new Error('The sample bank has inconsistent condition labels.');
    }
    if (!Number.isFinite(example.scale) || example.scale<=0 || !Array.isArray(example.channels) || example.channels.length!==data.channels.length) {
      throw new Error('A recorded example has an invalid display scale or channel count.');
    }
    example.channels.forEach(values=>{
      if (!Array.isArray(values) || values.length!==data.sampleRate*data.duration || !values.every(Number.isFinite)) {
        throw new Error('A recorded waveform contains incomplete or invalid values.');
      }
    });
    found.add(key);
  });
  return data;
}

function loadCompanionScript() {
  return new Promise((resolve,reject)=>{
    const script=document.createElement('script');
    let timer;
    const finish=error=>{
      clearTimeout(timer);
      script.onload=null;
      script.onerror=null;
      script.remove();
      if(error)reject(error);else resolve(window.EEGMeanFlowSamples);
    };
    script.src='assets/samples.js';
    script.onload=()=>window.EEGMeanFlowSamples?finish():finish(new Error('The sample data script is empty.'));
    script.onerror=()=>finish(new Error('The companion assets/samples.js file could not be opened.'));
    timer=setTimeout(()=>finish(new Error('The sample data download timed out.')),15000);
    document.head.append(script);
  });
}

async function getSamples() {
  // Unlike fetch(file://...), a local data script works when index.html is opened
  // directly, as well as over HTTP. Its payload exactly matches samples.json.
  if(window.EEGMeanFlowSamples)return window.EEGMeanFlowSamples;
  try { return await loadCompanionScript(); }
  catch(scriptError) {
    if(location.protocol==='file:')throw scriptError;
    const controller=new AbortController();
    const timer=setTimeout(()=>controller.abort(),15000);
    try {
      const response=await fetch('assets/samples.json',{signal:controller.signal});
      if(!response.ok)throw new Error(`The sample download returned HTTP ${response.status}.`);
      return await response.json();
    } finally { clearTimeout(timer); }
  }
}

async function initializeSamples() {
  if(loading)return;
  loading=true;
  setControlsEnabled(false);
  $('loading').classList.remove('hidden');
  $('loading').textContent='Opening recorded signals…';
  $('loading').setAttribute('role','status');
  $('loading').setAttribute('aria-live','polite');
  wave.closest('.explorer').setAttribute('aria-busy','true');
  try {
    bank=validateSamples(await getSamples());
    $('emotion-buttons').replaceChildren();
    bank.classes.forEach((name,index)=>{
      const button=document.createElement('button');
      button.type='button';
      button.textContent=name;
      button.dataset.emotion=index;
      button.setAttribute('aria-pressed',String(index===emotion));
      button.onclick=()=>{emotion=index;selectSample();};
      $('emotion-buttons').append(button);
    });
    $('timeline').max=bank.duration;
    setControlsEnabled(true);
    selectSample();
    $('loading').classList.add('hidden');
    wave.closest('.explorer').dataset.samples='ready';
  } catch(error) {
    setPlaying(false);
    bank=null;
    setControlsEnabled(false);
    $('scale-label').textContent='Samples unavailable';
    const message=document.createElement('p');
    message.textContent=location.protocol==='file:'?'Keep the assets folder beside index.html, then try again.':'The sample files could not be opened. Please retry.';
    const retry=document.createElement('button');
    retry.type='button';
    retry.className='retry-button';
    retry.textContent='Retry loading';
    retry.onclick=initializeSamples;
    $('loading').replaceChildren(message,retry);
    wave.closest('.explorer').dataset.samples='error';
    console.error('EEGMeanFlow signal explorer:',error.message);
  } finally {
    loading=false;
    wave.closest('.explorer').setAttribute('aria-busy','false');
  }
}

initializeSamples();
function frame(time){let delta=lastTime?Math.min((time-lastTime)/1000,.05):0;lastTime=time;if(!document.hidden){if(!reduced){heroPhase+=delta*.55;drawHero();}if(playing&&bank){position=Math.min(10,position+delta*1.5);if(position>=10)setPlaying(false);drawWave();}}requestAnimationFrame(frame);}
new ResizeObserver(()=>{drawWave();drawHero();}).observe(document.body);drawHero();requestAnimationFrame(frame);
const diagrams={process:{title:'Learn an average velocity.<br> Generate in one step.',description:'A class-conditioned MeanFlow objective learns interval velocities. At inference, one model evaluation maps Gaussian noise to a full multichannel EEG segment.',alt:'EEGMeanFlow overall training and one-step inference framework'},backbone:{title:'A temporal backbone.<br> A spectral perspective.',description:'A differential channel–band branch retains complex Fourier information across five bands and injects a channel-aware correction after the second DiT block.',alt:'EEG-aware transformer backbone and differential channel–band branch'},loss:{title:'Preserve the relationships<br> inside the waveform.',description:'Class-conditional energy U-statistics compare generated and real-training features: complex cross-spectrum and local directed covariance at four time lags.',alt:'Cross-spectrum and lag-covariance relationship loss'}};
const tabs=[...document.querySelectorAll('[data-diagram]')];
function chooseDiagram(button){let id=button.dataset.diagram,d=diagrams[id];tabs.forEach(t=>{t.setAttribute('aria-selected',t===button);t.tabIndex=t===button?0:-1;});$('method-panel').setAttribute('aria-labelledby',button.id);$('diagram-title').innerHTML=d.title;$('diagram-description').textContent=d.description;$('diagram-image').src=`assets/${id}.png`;$('diagram-image').alt=d.alt;$('diagram-pdf').href=`assets/${id}.pdf`;}
tabs.forEach((button,index)=>{button.onclick=()=>chooseDiagram(button);button.onkeydown=e=>{if(['ArrowLeft','ArrowRight','Home','End'].includes(e.key)){e.preventDefault();let i=e.key==='Home'?0:e.key==='End'?tabs.length-1:(index+(e.key==='ArrowRight'?1:-1)+tabs.length)%tabs.length;chooseDiagram(tabs[i]);tabs[i].focus();}};});
$('diagram-button').onclick=()=>{$('dialog-image').src=$('diagram-image').src;$('dialog-image').alt=$('diagram-image').alt;$('image-dialog').showModal();};$('close-dialog').onclick=()=>$('image-dialog').close();$('image-dialog').onclick=e=>{if(e.target===$('image-dialog'))$('image-dialog').close();};
