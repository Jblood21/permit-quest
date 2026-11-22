/* Road sign, signal and marking drawings (standard U.S. conventions). */
const VIS=(()=>{
const T=(x,y,s,t,f='#fff',w=800)=>`<text x="${x}" y="${y}" font-size="${s}" font-weight="${w}" fill="${f}" text-anchor="middle" font-family="Arial Black,Arial,Helvetica,sans-serif">${t}</text>`;
const sign=(inner,vb='0 0 120 120')=>`<svg viewBox="${vb}" role="img" aria-hidden="true" xmlns="http://www.w3.org/2000/svg">${inner}</svg>`;
const person=(x,y,c='#111')=>`<circle cx="${x}" cy="${y}" r="6" fill="${c}"/><path d="M${x} ${y+6}v22M${x} ${y+12}l-9 8M${x} ${y+12}l9 6M${x} ${y+28}l-8 16M${x} ${y+28}l9 14" stroke="${c}" stroke-width="5" stroke-linecap="round" fill="none"/>`;
const lamp=(i,on,col,blink,arrow)=>{const cy=28+i*32,dim='#34383f';
  const fill=on?col:dim;const cls=on&&blink?' class="blink"':'';
  const body=arrow?`<path d="M44 ${cy}l12 -10v6h14v8h-14v6z" fill="${on?col:'#4a4f58'}"/>`:`<circle cx="60" cy="${cy}" r="13" fill="${fill}"/>`;
  return `<g${cls}>${on&&!arrow?`<circle cx="60" cy="${cy}" r="17" fill="${col}" opacity=".25"/>`:''}${arrow?`<circle cx="60" cy="${cy}" r="14" fill="#1b1e23"/>`:''}${body}</g>`};
const light=(which,col,blink,arrow,label)=>sign(`<rect x="36" y="2" width="48" height="108" rx="10" fill="#15181d"/>${[0,1,2].map(i=>lamp(i,i===which,col,blink,arrow&&i===which)).join('')}${label?T(60,119,9,label,'#475569',700):''}`,'0 0 120 122');
const road=(lines,extra='')=>sign(`<rect width="160" height="100" fill="#3b4350"/>${lines}${extra}`,'0 0 160 100');
const V={
stop:sign(`<polygon points="36,4 84,4 116,36 116,84 84,116 36,116 4,84 4,36" fill="#C8102E"/><polygon points="38,11 82,11 109,38 109,82 82,109 38,109 11,82 11,38" fill="none" stroke="#fff" stroke-width="3"/>${T(60,73,27,'STOP')}`),
yield:sign(`<polygon points="60,116 2,12 118,12" fill="#C8102E" stroke="#C8102E" stroke-linejoin="round" stroke-width="6"/><polygon points="60,92 27,30 93,30" fill="#fff"/>${T(60,48,12,'YIELD','#C8102E')}`),
speed25:sign(`<rect x="14" y="4" width="92" height="112" rx="8" fill="#fff" stroke="#111" stroke-width="3"/><rect x="19" y="9" width="82" height="102" rx="5" fill="none" stroke="#111" stroke-width="1.5"/>${T(60,32,17,'SPEED','#111')}${T(60,52,17,'LIMIT','#111')}${T(60,100,46,'25','#111')}`),
rr:sign(`<circle cx="60" cy="60" r="55" fill="#FFD400" stroke="#111" stroke-width="3"/><path d="M34 34L86 86M86 34L34 86" stroke="#111" stroke-width="9" stroke-linecap="butt"/>${T(26,72,24,'R','#111')}${T(94,72,24,'R','#111')}`),
crossbuck:sign(`<rect x="56" y="70" width="8" height="48" fill="#8a8f98"/><g transform="rotate(34 60 50)"><rect x="6" y="40" width="108" height="20" rx="3" fill="#fff" stroke="#111" stroke-width="2"/></g><g transform="rotate(-34 60 50)"><rect x="6" y="40" width="108" height="20" rx="3" fill="#fff" stroke="#111" stroke-width="2"/></g>${T(60,53,8,'RAILROAD','#111')}`.replace(T(60,53,8,'RAILROAD','#111'),'')),
school:sign(`<polygon points="60,3 116,38 116,116 4,116 4,38" fill="#D6F01E" stroke="#111" stroke-width="3"/>${person(42,48)}${person(76,52)}`),
dne:sign(`<rect x="4" y="4" width="112" height="112" rx="10" fill="#fff" stroke="#111" stroke-width="2"/><circle cx="60" cy="60" r="44" fill="#C8102E"/><rect x="26" y="50" width="68" height="20" rx="2" fill="#fff"/>`),
wrongway:sign(`<rect x="4" y="22" width="112" height="76" rx="8" fill="#C8102E"/><rect x="9" y="27" width="102" height="66" rx="5" fill="none" stroke="#fff" stroke-width="2"/>${T(60,58,22,'WRONG')}${T(60,84,22,'WAY')}`),
oneway:sign(`<rect x="4" y="26" width="112" height="68" rx="6" fill="#111" stroke="#fff" stroke-width="2"/><path d="M16 60h58v-12l26 20-26 20v-12H16z" fill="#fff"/>${T(60,40,0,'')}`),
nouturn:sign(`<rect x="4" y="4" width="112" height="112" rx="10" fill="#fff" stroke="#111" stroke-width="2"/><path d="M44 90V52a16 16 0 0 1 32 0v14" fill="none" stroke="#111" stroke-width="9"/><path d="M64 64h24l-12 18z" fill="#111"/><circle cx="60" cy="60" r="44" fill="none" stroke="#C8102E" stroke-width="8"/><path d="M29 29L91 91" stroke="#C8102E" stroke-width="8"/>`),
roadwork:sign(`<polygon points="60,2 118,60 60,118 2,60" fill="#FF7A1A" stroke="#111" stroke-width="3"/><polygon points="60,10 110,60 60,110 10,60" fill="none" stroke="#111" stroke-width="1.5"/>${T(60,50,14,'ROAD','#111')}${T(60,67,14,'WORK','#111')}${T(60,84,14,'AHEAD','#111')}`),
ped:sign(`<polygon points="60,2 118,60 60,118 2,60" fill="#FFD400" stroke="#111" stroke-width="3"/>${person(60,30)}`),
hospital:sign(`<rect x="8" y="8" width="104" height="104" rx="10" fill="#1f5fbf" stroke="#fff" stroke-width="3"/>${T(60,86,70,'H')}`),
shield:sign(`<path d="M60 4C78 12 98 14 114 12C114 70 96 102 60 118C24 102 6 70 6 12C22 14 42 12 60 4Z" fill="#1f4e9e" stroke="#fff" stroke-width="3"/><path d="M60 4C78 12 98 14 114 12L112 40H8L6 12C22 14 42 12 60 4Z" fill="#C8102E"/>${T(60,32,10,'INTERSTATE')}${T(60,90,40,'15')}`),
red:light(0,'#ff3b30'),yellow:light(1,'#ffcc00'),flashyellow:light(1,'#ffcc00',true,false,'FLASHING'),flashred:light(0,'#ff3b30',true,false,'FLASHING'),
greenarrow:light(2,'#25d366',false,true),redarrow:light(0,'#ff3b30',false,true),flashyellowarrow:light(1,'#ffcc00',true,true,'FLASHING'),
dblyellow:road('<rect x="74" y="0" width="5" height="100" fill="#FFD400"/><rect x="83" y="0" width="5" height="100" fill="#FFD400"/>'),
dashyellow:road([0,1,2,3].map(i=>`<rect x="78" y="${6+i*25}" width="5" height="14" fill="#FFD400"/>`).join('')),
whitedash:road('<rect x="10" y="0" width="4" height="100" fill="#fff"/><rect x="146" y="0" width="4" height="100" fill="#fff"/>'+[0,1,2,3].map(i=>`<rect x="78" y="${6+i*25}" width="4" height="14" fill="#fff"/>`).join('')),
dblwhite:road('<rect x="76" y="0" width="4" height="100" fill="#fff"/><rect x="85" y="0" width="4" height="100" fill="#fff"/><path d="M40 50l14 -16 14 16 -14 16z" fill="none" stroke="#fff" stroke-width="4"/>')
};
/* Accessible names. Each says what is DRAWN (shape, color, words, symbol), never what it means or what to do.
   The picture is the question, so no label may state the answer. Words printed on a sign are read out, as a sighted student would read them. */
const ALT={
stop:'Red eight-sided sign with a white border and white capital letters reading STOP',
yield:'Downward-pointing triangle sign with a wide red border and a white center, with red capital letters reading YIELD',
speed25:'White upright rectangle sign with a black border. Black words SPEED LIMIT above a large black number 25',
rr:'Round yellow sign with a black X and a black letter R on each side of the X',
crossbuck:'White X-shaped sign on a gray post, with black capital letters reading RAILROAD across the arms',
school:'Yellow-green sign with five sides, shaped like a house front, showing two black child figures',
dne:'Square white sign with a black edge. A red circle holds a wide white horizontal bar',
wrongway:'Red rectangle sign with a white border and white capital letters on two lines reading WRONG WAY',
oneway:'Black rectangle sign with a white border and a long white arrow pointing right',
nouturn:'Square white sign with a black U-shaped arrow turning back on itself, inside a red circle with a red diagonal slash',
roadwork:'Orange diamond sign with a black border and three lines of black capital letters reading ROAD WORK AHEAD',
ped:'Yellow diamond sign with a black border and one black walking person',
hospital:'Square blue sign with a white border and a large white letter H',
shield:'Shield-shaped sign, blue with a red band across the top, white capital letters reading INTERSTATE at the top and a large white number 15 below',
red:'Traffic light with three lamps in a column. The top lamp glows red, the other two are dark',
yellow:'Traffic light with three lamps in a column. The middle lamp glows yellow, the other two are dark',
flashyellow:'Traffic light with three lamps in a column. The middle lamp glows yellow and blinks, with the word FLASHING below',
flashred:'Traffic light with three lamps in a column. The top lamp glows red and blinks, with the word FLASHING below',
greenarrow:'Traffic light with three lamps in a column. The bottom lamp shows a green arrow pointing left, the other two are dark',
redarrow:'Traffic light with three lamps in a column. The top lamp shows a red arrow pointing left, the other two are dark',
flashyellowarrow:'Traffic light with three lamps in a column. The middle lamp shows a yellow arrow pointing left and blinks, with the word FLASHING below',
dblyellow:'Gray road seen from above. Two solid yellow lines run side by side down the middle',
dashyellow:'Gray road seen from above. One broken yellow line, a row of short dashes, runs down the middle',
whitedash:'Gray road seen from above. A solid white line on each edge and a broken white line of dashes down the middle',
dblwhite:'Gray road seen from above. Two solid white lines run side by side down the middle, with a white diamond outline just left of them'
};
for(const k in V){if(!ALT[k])throw new Error('signs: no alt text for '+k);
  V[k]=V[k].replace('role="img" aria-hidden="true"','role="img" aria-label="'+ALT[k].replace(/"/g,'&quot;')+'"')}
window.VIS_ALT=ALT;
return V})();
