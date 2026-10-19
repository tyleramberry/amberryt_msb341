# Blind responses

Model names are hidden. The key is in blind.json; don't open it while rating.

## e1: Value chain reading to artifact

**Category:** learning

**Prompt:**

Here's my STRAT 401 reading on the value chain. Make me an interactive, visual artifact (a single HTML page) that teaches me everything I would learn from doing the reading, without me actually doing it.

**Context:**

The full reading is in reading.txt in the run folder (5,461 words). Each model reads it from that file.

**What good looks like:**

- Simple, effective graphics
- Concise, but leaves out nothing critical for class prep
- No made-up facts: everything comes from the reading

### Response A

<!doctype html>
<html lang="en">
<head>
<meta charset="utf-8">
<meta name="viewport" content="width=device-width,initial-scale=1">
<title>Value Chain Study Guide</title>
<style>
:root{--bg:#f7f6f2;--card:#fff;--ink:#1d2330;--mute:#5d6676;--line:#dcd9d0;--a:#c8102e;--b:#1f4e8c;--c:#2a7f62;--d:#b7791f;--soft:#eef2f8;--bad:#b42318;--good:#18794e}
@media (prefers-color-scheme:dark){:root{--bg:#14171d;--card:#1d222b;--ink:#e8eaee;--mute:#9aa3b2;--line:#323946;--a:#ff5470;--b:#6ea8ff;--c:#4cc9a0;--d:#f2b84b;--soft:#232a36;--bad:#ff7b72;--good:#4cc9a0}}
*{box-sizing:border-box}
body{margin:0;background:var(--bg);color:var(--ink);font:16px/1.55 system-ui,-apple-system,Segoe UI,Roboto,sans-serif}
header{padding:28px 16px 12px;max-width:980px;margin:0 auto}
h1{margin:0 0 4px;font-size:1.9rem}
.sub{color:var(--mute);margin:0}
nav{position:sticky;top:0;z-index:5;background:var(--bg);border-bottom:1px solid var(--line);display:flex;gap:6px;overflow-x:auto;padding:8px 16px;max-width:none}
nav button{border:1px solid var(--line);background:var(--card);color:var(--ink);padding:7px 12px;border-radius:999px;cursor:pointer;white-space:nowrap;font:inherit;font-size:.9rem}
nav button.on{background:var(--ink);color:var(--bg);border-color:var(--ink)}
main{max-width:980px;margin:0 auto;padding:16px}
section{display:none}section.on{display:block}
h2{margin:8px 0 6px;font-size:1.5rem}
h3{margin:22px 0 8px;font-size:1.1rem}
.card{background:var(--card);border:1px solid var(--line);border-radius:12px;padding:16px;margin:12px 0}
.big{font-size:1.15rem}
.grid{display:grid;gap:12px;grid-template-columns:repeat(auto-fit,minmax(230px,1fr))}
.pill{display:inline-block;font-size:.75rem;padding:2px 8px;border-radius:999px;background:var(--soft);color:var(--mute);margin-right:4px}
.stat{font-size:1.8rem;font-weight:700;line-height:1.1}
.mute{color:var(--mute);font-size:.9rem}
button.act{background:var(--b);color:#fff;border:0;border-radius:8px;padding:8px 14px;font:inherit;cursor:pointer}
button.act.alt{background:var(--soft);color:var(--ink);border:1px solid var(--line)}
.chain{display:grid;grid-template-columns:repeat(5,1fr) 70px;gap:6px;margin-top:6px}
.sup{grid-column:1/6;background:var(--soft);border:1px dashed var(--line);border-radius:8px;padding:10px;cursor:pointer;font-size:.9rem;text-align:center}
.pri{background:var(--b);color:#fff;border-radius:8px;padding:30px 4px;text-align:center;cursor:pointer;font-size:.9rem;font-weight:600;min-height:90px;display:flex;align-items:center;justify-content:center}
.sup.sel,.pri.sel{outline:3px solid var(--d)}
.margin{grid-row:1/6;grid-column:6;background:var(--c);color:#fff;border-radius:0 40px 40px 0;display:flex;align-items:center;justify-content:center;writing-mode:vertical-rl;font-weight:700;cursor:pointer}
.chain.link .pri{background:var(--a)}
@media(max-width:600px){.chain{grid-template-columns:repeat(5,1fr)}.margin{grid-row:auto;grid-column:1/6;writing-mode:horizontal-tb;border-radius:8px;padding:8px}.pri{font-size:.7rem;padding:20px 2px}}
details{border-top:1px solid var(--line);padding:10px 0}
summary{cursor:pointer;font-weight:600}
.bar{height:26px;border-radius:5px;display:flex;align-items:center;padding-left:8px;color:#fff;font-size:.85rem;font-weight:600;white-space:nowrap;transition:width .6s}
.row{display:grid;grid-template-columns:110px 1fr;gap:8px;align-items:center;margin:6px 0}
.chips span{display:inline-block;margin:3px;padding:4px 10px;border:1px solid var(--line);border-radius:999px;background:var(--card);cursor:pointer;font-size:.85rem}
.chips span.on{background:var(--d);color:#000;border-color:var(--d)}
.tri{display:flex;gap:8px;flex-wrap:wrap;justify-content:center}
.node{flex:1 1 200px;border:2px solid var(--b);border-radius:10px;padding:12px;text-align:center;background:var(--card);cursor:pointer;transition:.3s}
.node.off{opacity:.35;border-style:dashed;border-color:var(--bad)}
.q{margin:14px 0}
.opt{display:block;width:100%;text-align:left;margin:5px 0;padding:9px 12px;border:1px solid var(--line);background:var(--card);color:var(--ink);border-radius:8px;cursor:pointer;font:inherit}
.opt.right{background:var(--good);color:#fff;border-color:var(--good)}
.opt.wrong{background:var(--bad);color:#fff;border-color:var(--bad)}
.fb{font-size:.9rem;color:var(--mute);margin-top:4px}
.mm{display:flex;height:220px;border:1px solid var(--line);border-radius:8px;overflow:hidden;align-items:flex-end}
.mm div{display:flex;flex-direction:column;justify-content:flex-end;align-items:center;color:#fff;font-size:.72rem;text-align:center;transition:all .6s;height:100%}
.mm div span{padding:2px}
.tl{display:flex;align-items:flex-end;gap:2px;height:130px;margin-top:8px}
.tl div{flex:1;background:var(--b);border-radius:4px 4px 0 0;position:relative;min-width:0}
.tl small{position:absolute;bottom:100%;left:50%;transform:translateX(-50%);font-size:.7rem;white-space:nowrap}
.tl em{position:absolute;top:100%;left:50%;transform:translateX(-50%);font-size:.65rem;font-style:normal;color:var(--mute);white-space:nowrap}
.flip{cursor:pointer}
.flip .back{display:none}.flip.on .back{display:block}.flip.on .front{display:none}
.cheat{columns:2 300px;column-gap:16px}.cheat .card{break-inside:avoid}
.key{border-left:4px solid var(--d);padding:6px 12px;background:var(--soft);border-radius:0 8px 8px 0;margin:10px 0}
</style>
</head>
<body>
<header>
<h1>The Value Chain</h1>
<p class="sub">STRAT 401 reading, rebuilt as something you can click through. Start at the top tab and move right; about 20 minutes.</p>
</header>
<nav id="nav"></nav>
<main>

<section id="s0">
<h2>The big idea</h2>
<div class="card big">A <b>five-dollar pizza</b> sat in a warming rack in Michigan from 2004 until January 2022. The easy explanation is cheap cheese. The reading says that is wrong: the price came from a chain of about a dozen activities, each designed to cost less than the same activity at Domino's or Pizza Hut, and one of them (the delivery driver) was simply <b>deleted</b>.</div>
<div class="grid">
<div class="card"><div class="stat">9</div>Generic activities in Porter's chain: 5 primary, 4 support.</div>
<div class="card"><div class="stat">5</div>Steps in a value chain analysis.</div>
<div class="card"><div class="stat">10</div>Cost drivers to check before you assume "scale".</div>
<div class="card"><div class="stat">4</div>Steps to map a profit pool.</div>
</div>
<h3>The four takeaways</h3>
<div class="card">
<ol>
<li><b>Firms do not have costs; activities do.</b> Advantage is won or lost activity by activity.</li>
<li><b>The advantage often sits between the boxes</b> (linkages), which is why chains are hard to copy.</li>
<li><b>A value chain shows where cost went out, not who kept the savings.</b> Little Caesars' savings were partly captured by the franchisor. Ask both questions.</li>
<li><b>Profit pools:</b> profit is often concentrated in a very different part of the chain than revenue. Value chain = efficiency tool (your ledger). Profit pool = positioning tool (industry filings).</li>
</ol></div>
<div class="key">The closing challenge: draw <i>your</i> chain, split until boxes have different economics, put a cost and an asset on each, then ask: if you could defend only one activity to the last dollar, which is it, and is it the one you are funding?</div>
<button class="act" onclick="go(1)">Start: Porter's chain</button>
</section>

<section id="s1">
<h2>Porter's chain (1985)</h2>
<p>Michael Porter's radical move: stop treating advantage as a property of "well run" firms. A firm is a bundle of discrete activities. <b>Click any box</b> to see what it means and what Little Caesars does there.</p>
<div class="card">
<div class="chain" id="chain"></div>
<div style="margin:10px 0"><button class="act alt" id="lnkbtn" onclick="toggleLinks()">Show linkages</button></div>
<div id="chainInfo" class="key">Click a box.</div>
</div>
<h3>Two things routinely missed</h3>
<div class="card">
<b>1. The boxes are a starting point.</b> Split an activity when its parts have different economics. "Operations" at an airline is not one thing: gate turnaround and engine overhaul have almost nothing in common. If every activity in your chain has the same cost driver, you have not cut finely enough.
<hr style="border:0;border-top:1px solid var(--line)">
<b>2. Advantage may live between the boxes (linkages).</b> A linkage exists when one activity's cost depends on how another is performed. Examples: spend more on inbound inspection, spend less on rework. Hold more inventory, spend less on expediting. Design a snap-fit part, shorten assembly.
</div>
<h3>Case: Amazon's 2023 network redesign (a linkage story)</h3>
<div class="card">
<p class="mute">Eight largely self-sufficient US regions. No single activity got cheaper; the relationships changed.</p>
<div class="grid">
<div><div class="stat">-15%</div>distance, site to customer</div>
<div><div class="stat">-12%</div>middle-mile touch points</div>
<div><div class="stat">62 to 76%</div>orders fulfilled inside own region</div>
<div><div class="stat">-$0.45</div>per unit, first cut since 2018</div>
</div></div>
<h3>Why rivals cannot copy it</h3>
<div class="card">A rival can observe any single activity: store layouts, prices, job postings, patents. What they cannot see is <b>which activity is subsidizing which</b>.</div>
<button class="act" onclick="go(2)">Next: how to run the analysis</button>
</section>

<section id="s2">
<h2>How to run a value chain analysis</h2>
<p>The framework is descriptive; the analysis is not. Open each step for the question that keeps it honest.</p>
<div class="card" id="steps"></div>
<h3>Porter's ten cost drivers</h3>
<p class="mute">Click to mark the ones you think drive cost in a pretend activity of your own. The point: go through all ten, not just scale.</p>
<div class="card chips" id="drivers"></div>
<div class="mute" id="drvmsg"></div>
<div class="key"><b>Test of step 2:</b> "If we had to sell this activity as a standalone business tomorrow, what would its income statement look like?" An activity that is cheap to run but eats working capital is not cheap.</div>
<button class="act" onclick="go(3)">Next: Little Caesars</button>
</section>

<section id="s3">
<h2>Little Caesars: cost built activity by activity</h2>
<div class="card">
<b>Key insight:</b> the biggest saving is what LC <i>does not perform at all</i>: no order-taking before making pizza, no drivers, no counter at the Portal. Deleting an activity is the most reliable cost reduction because a rival cannot answer by simply doing it cheaper.</div>
<h3>Exhibit 2: the chain, tap each</h3>
<div class="grid" id="lcact"></div>

<h3>The linkage triangle: pull one out</h3>
<p class="mute">Click a node to remove it and see what happens.</p>
<div class="card">
<div class="tri" id="tri"></div>
<div class="key" id="trimsg">All three hold each other up. This is why "just sell a cheaper pizza" has never worked for anyone else.</div>
</div>

<h3>The twist: the story usually told is incomplete</h3>
<p>The reading argues LC pairs <b>low cost with low throughput</b>, unlike Walmart (low cost with enormous volume). Fixed costs get spread over fewer dollars.</p>
<div class="card">
<b>Average sales per restaurant</b> (QSR, FY2025)
<div id="auv"></div>
<p class="mute">LC is about 69% of Domino's volume, stable for two years. LC figure is a QSR estimate.</p>
</div>
<div class="card">
<b>Franchisee fee load (royalty + marketing)</b>
<div id="fees"></div>
<p class="mute">Debunked claim: "LC spends less on advertising because the price does the selling." The one mandatory, disclosed comparable says otherwise. Marketing can rise to 7%.</p>
</div>
<div class="card">
<b>Initial investment floor</b>
<div id="inv"></div>
<p class="mute">Over 4x Domino's, driven by a mandatory pre-opening Blue Line equipment and inventory buy of $250,500 to $369,500. Source caveat: LC's own site says $376,500; the FDD abstracts say $446,500. Unresolved.</p>
</div>
<div class="card">
<b>Governance contrast: same vertical integration, opposite rules</b>
<div class="grid">
<div class="card"><b>Domino's</b><br>22 US supply chain centers. Franchisees are <u>not required</u> to buy. Those who buy everything get 50% of the supply chain's pre-tax profit. Must win business yearly.</div>
<div class="card"><b>Little Caesars</b><br>Blue Line is mandatory (franchisees bought $1.64B in FY2021). No profit share disclosed. Does not have to win it.</div>
</div></div>

<h3>The price advantage has narrowed</h3>
<div class="card">
<div class="tl" id="tl"></div>
<p class="mute" style="margin-top:26px">Hot-N-Ready price: $5 (2004 to Jan 2022), $5.55 (Jan 2022, with 33% more pepperoni), about $6.79 per third-party trackers now. Domino's has repeatedly run a $9.99 "Best Deal Ever". In July 2025 LC launched its first-ever value menu at $9.99, online only. The reading's read: it was following, not setting, and online-only moves the offer away from the walk-in, no-wait, no-decision mechanic the chain was built for.</p>
</div>
<div class="card">
<b>Satisfaction (ACSI 2026)</b>
<div id="acsi"></div>
<p class="mute">LC wins on price perception (Datassential's value leader), loses on satisfaction. "What a low-price, low-volume position looks like from the outside." Yet net US units still grew by 93 in 2025 while the category shrank.</p>
</div>
<div class="key"><b>Verdict:</b> A value chain tells you where cost went out. It does not tell you <u>who kept it</u>. Ask both.</div>
<button class="act" onclick="go(4)">Next: owning one link</button>
</section>

<section id="s4">
<h2>Own one link</h2>
<p>The opposite of LC's strategy: take one activity and be so far beyond everyone that the industry has to come to you. Tap a card to flip it for the mechanism.</p>
<div class="grid" id="links"></div>
<div class="key">Pattern: in each case the advantage is a <b>mechanism</b> (chokepoint control, a promise, a lease, externalizing a cost center), not just "being good".</div>
<button class="act" onclick="go(5)">Next: profit pools</button>
</section>

<section id="s5">
<h2>Profit pools</h2>
<div class="card">
<b>U-Haul (late 1990s):</b> earned a 10% operating margin when consumer truck rental earned under 3%. The money was in boxes, tape, insurance, hitches and storage, bought after the customer signed and stopped comparison shopping. U-Haul held truck rates down on purpose: the low-margin activity acquires the customer for the high-margin one.</div>
<div class="key"><b>Definition</b> (Gadiesh and Gilbert, HBR 1998): total profit earned at every point along an industry's value chain. Profit concentration is often very different from revenue concentration.<br><b>Value chain</b> = from your general ledger, shows your costs, efficiency instrument. <b>Profit pool</b> = from industry filings, shows everyone's profit, positioning instrument ("am I standing in the right part of the chain?").</div>
<h3>The four steps</h3>
<div class="card">
<ol><li><b>Define boundaries.</b> This step determines the answer, and no principle exists for drawing the line.</li>
<li><b>Estimate total pool size</b> (profit, not revenue).</li>
<li><b>Estimate each activity's share.</b> Hard; margins are rarely disclosed, so use pure-play comparables and triangulation.</li>
<li><b>Check and reconcile.</b> A quarter of the method is reconciliation: the authors knew the numbers would not tie out.</li></ol>
<p class="mute">Drawing convention: x-axis = share of industry revenue, y-axis = operating margin, so block area = profit. Tall and narrow = small and rich. Wide and flat = large and poor.</p></div>

<h3>Exhibit 6: inside a car dealership (AutoNation 2025)</h3>
<div class="card">
<button class="act" id="mmbtn" onclick="toggleMM()">Switch to gross profit view</button>
<div class="mm" id="mm" style="margin-top:10px"></div>
<p class="mute" id="mmcap"></p>
<p>$27.6B revenue, $4.9B gross profit. Parts and service plus finance and insurance are 22.8% of sales but <b>77.2%</b> of gross profit. "Used and other" below is the remainder I computed; the reading does not itemize it.</p>
</div>

<h3>Coffee: where €9.71 per kg goes (Germany, 2021)</h3>
<div class="card">
<div id="coffee"></div>
<p class="mute">Itemized shares total 88%; the rest is not broken out in the reading (study shares are modeled and rounded). Excise tax at 23% would not appear in a US version: do not over-generalize. Finding: farmer prices are disconnected from consumer prices; value concentrates between importer and retailer.</p>
<p class="mute"><b>iPhone warning:</b> the famous "Apple takes 58% of iPhone 4 price as profit vs about 2% for China labor" uses 2010 data and is not a full retail-dollar decomposition (Apple was paid by carriers then).</p>
</div>

<h3>Three more pools</h3>
<div class="grid">
<div class="card"><b>Delta is a credit card</b><div class="stat">141%</div>Amex remuneration $8.2B (up 11%) = 12.9% of $63.4B revenue and 141% of $5.8B operating income.</div>
<div class="card"><b>Apple is a phone industry</b><div class="stat">85%</div>of industry operating profit (last published, 2023). 49% of revenue in Q2 2026 on 23% of shipments.</div>
<div class="card"><b>Booking beats Marriott</b><div class="stat">2.1x</div>Booking: $186.1B booked, $26.9B revenue, $8.825B operating income, no rooms owned. Marriott: $4.141B. Hotel owners (property, debt, cycle) have the shallowest pool per dollar of capital.</div>
</div>
<button class="act" onclick="go(6)">Next: test yourself</button>
</section>

<section id="s6">
<h2>Check yourself</h2>
<p class="mute">Eight questions, with explanations.</p>
<div id="quiz"></div>
<div class="card big" id="score"></div>
</section>

<section id="s7">
<h2>One-page cheat sheet</h2>
<div class="cheat">
<div class="card"><b>Core claim</b><br>Advantage lives in activities and in the links between them, not in "firms."</div>
<div class="card"><b>Porter's 9</b><br>Primary: inbound logistics, operations, outbound logistics, marketing and sales, service. Support: firm infrastructure, HR, technology development, procurement. Margin = willingness to pay minus total cost.</div>
<div class="card"><b>5 analysis steps</b><br>1 Disaggregate. 2 Cost and asset per box. 3 Cost drivers. 4 Work the linkages. 5 Own / buy / let someone else's brand ride.</div>
<div class="card"><b>10 cost drivers</b><br>Scale, learning, capacity utilization, linkages, interrelationships across units, vertical integration, timing of entry, discretionary policy, location, institutional factors.</div>
<div class="card"><b>Little Caesars</b><br>Delete activities (drivers, order-taking, counter). Made-ahead + narrow menu + low price reinforce each other. But: AUV about $950K vs $1,385K, fees 11% vs 9.5%, floor $446.5K vs $107K, price up to $5.55 then about $6.79, ACSI 78 (last of 4).</div>
<div class="card"><b>Own one link</b><br>ASML (supplier chokepoint, Zeiss stake), TSMC (promise not to compete), YKK (machines leased into customers' factories), Amazon (cost center sold to rivals' customers), Ritz-Carlton ($2,000 discretion).</div>
<div class="card"><b>Profit pool</b><br>Total profit at every point in the chain. 4 steps: boundaries, size, shares, reconcile. Map: x = revenue share, y = margin, area = profit.</div>
<div class="card"><b>Examples</b><br>U-Haul accessories. Dealership: P&amp;S + F&amp;I = 22.8% of sales, 77.2% of gross profit. Coffee farm 21%. Delta Amex 141% of op. income. Booking 2x Marriott.</div>
<div class="card"><b>Always ask</b><br>Where did the cost go out, and <i>who kept it</i>? Am I standing in the right part of the chain?</div>
</div>
</section>
</main>

<script>
const $=id=>document.getElementById(id);
const tabs=["Big idea","Porter's chain","Method","Little Caesars","Own one link","Profit pools","Quiz","Cheat sheet"];
function go(i){document.querySelectorAll('section').forEach((s,j)=>s.classList.toggle('on',i===j));[...$('nav').children].forEach((b,j)=>b.classList.toggle('on',i===j));scrollTo(0,0);}
tabs.forEach((t,i)=>{const b=document.createElement('button');b.textContent=t;b.onclick=()=>go(i);$('nav').appendChild(b)});
go(0);

/* Chain */
const prim=[["Inbound logistics","Receiving, storing and distributing inputs.","Blue Line, an Ilitch-owned distributor, is the required supplier: one captive distributor, one truck, one negotiation."],
["Operations","Turning inputs into the product.","Pizza made to forecast and held in a warming rack; narrow menu; small stores run ovens at high utilization."],
["Outbound logistics","Getting the product to the buyer.","Carryout only 1959 to 2019; delivery via DoorDash Drive, no owned fleet; the Pizza Portal self-service locker."],
["Marketing and sales","Making buyers aware and willing.","One number for 18 years: $5, Hot-N-Ready, no coupon. A price that needs no explanation is cheaper to communicate."],
["Service","Keeping the product's value after sale.","Not a focus in the reading for LC; Ritz-Carlton is the example (up to $2,000 per employee to fix a problem)."]];
const sup=[["Firm infrastructure","General management, finance, legal."],["Human resources","Hiring, training, pay. Ritz-Carlton: 250 to 310 hours first-year training."],["Technology development","Product and process know-how. Often not costed at all."],["Procurement","Buying inputs. Most firms cannot put a cost on it, which is why surprises hide here."]];
function info(h,t){$('chainInfo').innerHTML=h+t}
const ch=$('chain');
sup.forEach(s=>{const d=document.createElement('div');d.className='sup';d.style.gridColumn='1/6';d.innerHTML='<b>'+s[0]+'</b> <span class="mute">(support)</span>';d.onclick=()=>{sel(d);info('<b>'+s[0]+'</b> (support activity, runs across all primary ones). ',s[1])};ch.appendChild(d)});
prim.forEach(p=>{const d=document.createElement('div');d.className='pri';d.textContent=p[0];d.onclick=()=>{sel(d);info('<b>'+p[0]+'</b> (primary). '+p[1]+'<br><b>Example:</b> ',p[2])};ch.appendChild(d)});
const m=document.createElement('div');m.className='margin';m.textContent='MARGIN';m.onclick=()=>{sel(m);info('<b>Margin</b>: what is left when the buyer\'s willingness to pay exceeds the collective cost of all activities.','')};ch.appendChild(m);
ch.querySelectorAll('.sup').forEach((s,i)=>s.style.gridRow=String(i+1));
ch.querySelectorAll('.pri').forEach(p=>p.style.gridRow='5 / span 1');
function sel(el){ch.querySelectorAll('.sel').forEach(x=>x.classList.remove('sel'));el.classList.add('sel')}
let lk=false;
function toggleLinks(){lk=!lk;ch.classList.toggle('link',lk);$('lnkbtn').textContent=lk?'Hide linkages':'Show linkages';
info(lk?'<b>Linkages</b> (red): the cost or effectiveness of one activity depends on how another is done. Inspection vs rework. Inventory vs expediting. Snap-fit design vs assembly time. LC: made-ahead production needs a narrow menu, which needs a low price, which needs high throughput per labor hour.':'Click a box.','')}

/* Steps */
const steps=[["Disaggregate until activities have different economics","Which activities have genuinely different cost behavior? Which are a large or growing share of cost? Which does the buyer perceive?"],
["Put a cost and an asset against every box","Most firms can do this for the plant, almost none for procurement or technology development, which is where surprises are. Standalone-business test: what would its income statement look like?"],
["Ask what drives cost in each box","Go through all ten drivers. Is cost driven by how much we do, how long we have done it, or a policy set in 1998?"],
["Work the linkages, not the boxes","Find pairs where spending more in one place saves more in another, and local optimizations that push cost downstream. Includes supplier and channel chains. Whose budget absorbs the cost of our choice, and do they know?"],
["Decide what to own, buy, or let someone else's brand ride on","The chain is a map of make-or-buy decisions mostly made by accident. Which would we defend to the last dollar, and which do we do only because we always have?"]];
steps.forEach((s,i)=>{const d=document.createElement('details');if(!i)d.open=true;d.innerHTML='<summary>Step '+(i+1)+': '+s[0]+'</summary><p>'+s[1]+'</p>';$('steps').appendChild(d)});
const drv=["Scale","Learning","Capacity utilization","Linkages","Interrelationships across units","Vertical integration","Timing of entry","Discretionary policy","Location","Institutional factors (regulation, unions)"];
drv.forEach(n=>{const s=document.createElement('span');s.textContent=n;s.onclick=()=>{s.classList.toggle('on');const c=document.querySelectorAll('#drivers .on').length;$('drvmsg').textContent=c+' of 10 selected. '+(c<3?'Keep going: the discipline is checking all ten.':'Good: now ask which one actually dominates.')};$('drivers').appendChild(s)});

/* LC */
const lc=[["Inbound and procurement","Blue Line is the required supplier; Pepsi exclusive beverage.","One captive distributor, one truck, one negotiation. $1.64B bought via it in FY2021."],
["Operations","Made to forecast, warming rack, narrow menu, 1,000 to 1,600 sq ft stores (modular opens in about 90 days).","Ovens run at high utilization. Less space, rent, equipment, training, energy."],
["Outbound","Carryout only 1959 to 2019. Delivery via DoorDash Drive. Pizza Portal locker (Sept 2018).","No drivers, no vehicle insurance, no scheduling risk, and with Portal, no counter transaction."],
["Marketing and sales","$5, Hot-N-Ready, no coupon, no wait, no decision for 18 years.","A price needing no explanation is cheaper to communicate than an offer that does."]];
lc.forEach(a=>{const d=document.createElement('div');d.className='card flip';d.innerHTML='<div class="front"><b>'+a[0]+'</b><p>'+a[1]+'</p><span class="mute">tap for why it costs less</span></div><div class="back"><b>Why it costs less</b><p>'+a[2]+'</p></div>';d.onclick=()=>d.classList.toggle('on');$('lcact').appendChild(d)});
const tri=[["Made-ahead production","gives high throughput per labor hour"],["Narrow menu","makes a forecast over 4 products tractable (not 40)"],["Low price","works because variety is demanded when price is high"]];
const triMsg=["Without made-ahead production, throughput per labor hour falls, so the low price stops working, and a narrow menu loses its reason to exist.","Without a narrow menu you cannot forecast over forty items, so made-ahead production breaks.","Without a low price buyers demand variety, so the narrow menu fails, and high throughput no longer pays."];
tri.forEach((t,i)=>{const d=document.createElement('div');d.className='node';d.innerHTML='<b>'+t[0]+'</b><br><span class="mute">'+t[1]+'</span>';d.onclick=()=>{const was=d.classList.contains('off');document.querySelectorAll('.node').forEach(n=>n.classList.remove('off'));if(!was){d.classList.add('off');$('trimsg').textContent=triMsg[i]}else $('trimsg').textContent='All three hold each other up.'};$('tri').appendChild(d)});
function bars(id,data,max,fmt,cols){$(id).innerHTML=data.map((d,i)=>'<div class="row"><span>'+d[0]+'</span><div class="bar" style="width:'+(d[1]/max*100)+'%;background:'+(cols?cols[i]:'var(--b)')+'">'+fmt(d[1])+'</div></div>').join('')}
const R='var(--a)',B='var(--b)';
bars('auv',[["Little Caesars",950000],["Domino's",1385000]],1385000,v=>'$'+(v/1000).toLocaleString()+'K',[R,B]);
bars('fees',[["Little Caesars",11],["Pizza Hut",10.75],["Domino's",9.5]],11,v=>v+'%',[R,B,B]);
bars('inv',[["Little Caesars",446500],["Domino's",107450]],446500,v=>'$'+v.toLocaleString(),[R,B]);
bars('acsi',[["Pizza Hut",80],["Papa Johns",80],["Domino's",79],["Little Caesars",78]],80,v=>v+' (industry avg 79)',[B,B,B,R]);
const tl=[["2004",5],["2021",5],["Jan 2022",5.55],["Now (tracker)",6.79],["Jul 2025 value menu*",9.99]];
tl.forEach(t=>{const d=document.createElement('div');d.style.height=(t[1]/10*100)+'%';d.style.background=t[1]>=9?'var(--d)':'var(--b)';d.innerHTML='<small>$'+t[1]+'</small><em>'+t[0]+'</em>';$('tl').appendChild(d)});

/* Links */
const lnk=[["Inbound logistics","ASML","Only maker of EUV lithography. 2025: EUR 32.7B sales, 52.8% gross, 34.6% operating margin; EUR 38.8B backlog; sold out into 2027. JPMorgan: 94% of lithography.","It coordinates 5,100 suppliers. In 2016 paid EUR 1B for 24.9% of Carl Zeiss SMT, the only EUV mirror optics house, plus EUR 220M R&D and EUR 540M capital funding. Buying the chokepoint inside the chokepoint. A rival would need to rebuild a three-decade supplier network."],
["Operations","TSMC","72.5% of global foundry revenue in Q2 2026 (Samsung 5.9%). 67.7% gross, 60.3% operating margin.","Built on a promise: it never competes with its customers. So Nvidia, Apple, AMD, Qualcomm shed their fabs, concentrating demand into one queue, funding capex, sustaining the node lead, attracting demand. It gave up designing chips to own the activity nobody else wanted to fund."],
["Operations","YKK","About 40% of world zippers; over 10 billion units a year (3 million km, about 80x around Earth).","Makes its own brass, alloys, tape, machinery. Leases machines into customers' factories (a switching cost). Zipper is about 1% of garment cost yet carries the only legible logo, so brands specify YKK. Private: no margins published (a limit on the case)."],
["Outbound logistics","Amazon","2025: 6.7B US parcels, passing USPS, 1.5x UPS. May 2026: sells the capability (Amazon Supply Chain Services) to P&G, 3M, Lands' End, American Eagle. FedEx and UPS shares fell about 10%.","Porter's argument on one activity: internal cost center, optimized into an advantage, then externalized and sold to incumbents' own customers."],
["Service","The Ritz-Carlton","Any employee may spend up to $2,000 to fix a guest problem on the spot.","Results: RevPAR over 300% above industry average; pre-tax ROI 5.3% to 9.8% (1995 to 1998); 250 to 310 training hours in year one; turnover down nine straight years."]];
lnk.forEach(l=>{const d=document.createElement('div');d.className='card flip';d.innerHTML='<div class="front"><span class="pill">'+l[0]+'</span><h3 style="margin:6px 0">'+l[1]+'</h3><p>'+l[2]+'</p><span class="mute">tap for the mechanism</span></div><div class="back"><span class="pill">'+l[0]+'</span><h3 style="margin:6px 0">'+l[1]+': mechanism</h3><p>'+l[3]+'</p></div>';d.onclick=()=>d.classList.toggle('on');$('links').appendChild(d)});

/* Marimekko */
const mmData=[["New vehicles",48.9,13.4,"#1f4e8c"],["Used and other*",28.3,9.4,"#7a8699"],["Finance and insurance*",5.3,29.6,"#b7791f"],["Parts and service",17.5,47.6,"#2a7f62"]];
let prof=false;
function drawMM(){$('mm').innerHTML=mmData.map(d=>{const w=d[1],h=prof?d[2]:d[1];return '<div style="width:'+w+'%;background:'+d[3]+';height:'+(prof?d[2]/47.6*100:d[1]/48.9*100)+'%"><span>'+d[0]+'<br><b>'+(prof?d[2]:d[1])+'%</b></span></div>'}).join('');
$('mmcap').textContent=prof?'Bar height = share of gross profit (width = share of revenue). Parts and service is skinny but towering.':'Bar height = share of revenue. New vehicles dominate by volume.';
$('mmbtn').textContent=prof?'Switch to revenue view':'Switch to gross profit view'}
function toggleMM(){prof=!prof;drawMM()}drawMM();
$('mmcap').insertAdjacentHTML('afterend','<p class="mute">*F&I derived as 22.8% minus 17.5% = 5.3% of revenue and 77.2% minus 47.6% = 29.6% of profit. Used/other = remainder.</p>');

/* Coffee */
bars('coffee',[["German excise tax",23],["Roasting",22],["Retail",22],["Farm / cultivation",21]],23,v=>v+'%',['#7a8699','#b7791f','#b7791f','#2a7f62']);

/* Quiz */
const Q=[["Per Porter, where do costs actually reside?",["In the firm as a whole","In discrete activities","In the brand","In the CEO's decisions"],1,"A firm has no costs; its activities do. A firm wins or loses in each separately."],
["What is a linkage?",["Two firms merging","When the cost or effectiveness of one activity depends on how another is performed","A supplier contract","A support activity"],1,"E.g. more inbound inspection, less rework."],
["Why is deleting an activity the most reliable cost reduction?",["It is easy","Regulators like it","A rival cannot answer by doing it more cheaply, since it is gone","It raises quality"],2,"Doing it cheaper invites the rival to respond in kind."],
["Which is TRUE about Little Caesars versus Domino's per the reading?",["LC has higher volume per store","LC franchisees pay lower total fees","LC's initial investment floor is over 4x Domino's","LC leads on satisfaction"],2,"$446,500 vs $107,450. Volume is about 69% of Domino's; fees 11% vs 9.5%; ACSI 78 vs 79."],
["What does a value chain analysis NOT tell you?",["Where cost went out","Which activities drive cost","Who kept the savings","Which activities differ in economics"],2,"The reading: ask both where cost went out and who kept it."],
["How does TSMC own the operations link?",["Cheapest wages","Promising never to compete with its customers","Patents on zippers","Owning designs"],1,"The promise let customers shed fabs, concentrating demand in one queue."],
["In AutoNation's 2025 results, parts and service plus finance and insurance were:",["22.8% of sales and 77.2% of gross profit","77.2% of sales and 22.8% of gross profit","50% of both","New vehicles' share"],0,"Pattern of profit differs sharply from pattern of revenue."],
["Value chain vs profit pool: which is the positioning tool?",["Value chain","Profit pool","Both","Neither"],1,"A profit pool asks whether you are standing in the right part of the chain at all; the value chain is an efficiency instrument."]];
let sc=0,ans=0;
Q.forEach((q,i)=>{const d=document.createElement('div');d.className='card q';d.innerHTML='<b>'+(i+1)+'. '+q[0]+'</b>';const fb=document.createElement('div');fb.className='fb';
q[1].forEach((o,j)=>{const b=document.createElement('button');b.className='opt';b.textContent=o;b.onclick=()=>{if(d.dataset.done)return;d.dataset.done=1;ans++;if(j===q[2]){sc++;b.classList.add('right')}else{b.classList.add('wrong');d.querySelectorAll('.opt')[q[2]].classList.add('right')}fb.textContent=q[3];$('score').textContent='Score: '+sc+' / '+ans+' answered (of '+Q.length+')'+(ans===Q.length?(sc>=7?'. You have got it.':'. Revisit the tabs for the ones you missed.'):'')};d.appendChild(b)});
d.appendChild(fb);$('quiz').appendChild(d)});
$('score').textContent='Score: 0 / 0 answered';
</script>
</body>
</html>


### Response B

<!doctype html>
<html lang="en">
<head>
<meta charset="utf-8">
<meta name="viewport" content="width=device-width, initial-scale=1">
<title>The Value Chain</title>
<style>
:root{
  --bg:#f7f5f0; --surface:#ffffff; --surface2:#efece4; --ink:#1d1b18; --muted:#615c53; --line:#d9d4c8;
  --accent:#b8412c; --accent-soft:#f4ddd6; --primary:#2f6f8f; --primary-soft:#d8e8ef; --support:#6b5b95; --support-soft:#e5e0f0;
  --good:#2e7d4f; --good-soft:#d9efe1; --warn:#a86b00; --warn-soft:#f6e7c8; --margin:#c99a2e; --margin-soft:#f5ead0;
  --shadow:0 1px 2px rgba(0,0,0,.05),0 4px 14px rgba(0,0,0,.05);
}
@media (prefers-color-scheme: dark){
  :root:not([data-theme="light"]){
    --bg:#16151a; --surface:#1f1e24; --surface2:#2a2830; --ink:#ece9e3; --muted:#a8a296; --line:#3a3841;
    --accent:#e9765f; --accent-soft:#3d2520; --primary:#6fb3d4; --primary-soft:#1d3440; --support:#a796d6; --support-soft:#2c2640;
    --good:#6cc794; --good-soft:#1b3326; --warn:#e3b04f; --warn-soft:#3a2e15; --margin:#e3bd5f; --margin-soft:#3a3018;
    --shadow:0 1px 2px rgba(0,0,0,.3),0 4px 14px rgba(0,0,0,.25);
  }
}
:root[data-theme="dark"]{
  --bg:#16151a; --surface:#1f1e24; --surface2:#2a2830; --ink:#ece9e3; --muted:#a8a296; --line:#3a3841;
  --accent:#e9765f; --accent-soft:#3d2520; --primary:#6fb3d4; --primary-soft:#1d3440; --support:#a796d6; --support-soft:#2c2640;
  --good:#6cc794; --good-soft:#1b3326; --warn:#e3b04f; --warn-soft:#3a2e15; --margin:#e3bd5f; --margin-soft:#3a3018;
  --shadow:0 1px 2px rgba(0,0,0,.3),0 4px 14px rgba(0,0,0,.25);
}
*{box-sizing:border-box}
html{scroll-behavior:smooth}
body{margin:0;background:var(--bg);color:var(--ink);font:16px/1.6 -apple-system,BlinkMacSystemFont,"Segoe UI",Inter,Roboto,Helvetica,Arial,sans-serif;-webkit-font-smoothing:antialiased}
.wrap{max-width:980px;margin:0 auto;padding:0 16px}
header.top{position:sticky;top:0;z-index:20;background:color-mix(in srgb,var(--bg) 90%,transparent);backdrop-filter:blur(8px);border-bottom:1px solid var(--line)}
header.top .wrap{display:flex;align-items:center;gap:12px;height:52px}
header.top strong{font-size:15px;white-space:nowrap}
nav.toc{display:flex;gap:4px;overflow-x:auto;scrollbar-width:none;flex:1}
nav.toc::-webkit-scrollbar{display:none}
nav.toc a{font-size:13px;color:var(--muted);text-decoration:none;padding:5px 9px;border-radius:999px;white-space:nowrap}
nav.toc a:hover,nav.toc a.on{background:var(--surface2);color:var(--ink)}
#themeBtn{border:1px solid var(--line);background:var(--surface);color:var(--ink);border-radius:999px;padding:4px 10px;font-size:12px;cursor:pointer}
.progress{position:fixed;top:52px;left:0;height:3px;background:var(--accent);width:0;z-index:21}
section{padding:56px 0 28px;border-bottom:1px solid var(--line)}
h1{font-size:clamp(30px,6vw,52px);line-height:1.08;margin:0 0 14px;letter-spacing:-.02em}
h2{font-size:clamp(24px,4vw,34px);line-height:1.15;margin:0 0 8px;letter-spacing:-.01em}
h3{font-size:19px;margin:22px 0 8px}
.kicker{font-size:12px;letter-spacing:.12em;text-transform:uppercase;color:var(--accent);font-weight:700;margin-bottom:8px}
.lede{font-size:18px;color:var(--muted);max-width:720px}
p{max-width:740px}
.card{background:var(--surface);border:1px solid var(--line);border-radius:14px;padding:18px;box-shadow:var(--shadow)}
.grid2{display:grid;grid-template-columns:repeat(auto-fit,minmax(260px,1fr));gap:14px}
.grid3{display:grid;grid-template-columns:repeat(auto-fit,minmax(220px,1fr));gap:14px}
.big{font-size:44px;font-weight:800;line-height:1;letter-spacing:-.02em}
.small{font-size:13px;color:var(--muted)}
.pill{display:inline-block;font-size:12px;font-weight:600;padding:2px 9px;border-radius:999px;background:var(--surface2);color:var(--muted)}
.callout{border-left:4px solid var(--accent);background:var(--accent-soft);padding:14px 16px;border-radius:0 10px 10px 0;margin:18px 0;max-width:760px}
.callout.good{border-color:var(--good);background:var(--good-soft)}
.callout.warn{border-color:var(--warn);background:var(--warn-soft)}
.callout b:first-child{display:block;margin-bottom:2px}
button.btn{font:inherit;font-size:14px;border:1px solid var(--line);background:var(--surface);color:var(--ink);padding:7px 13px;border-radius:9px;cursor:pointer}
button.btn:hover{border-color:var(--accent)}
button.btn.on{background:var(--ink);color:var(--bg);border-color:var(--ink)}
.row{display:flex;gap:8px;flex-wrap:wrap;align-items:center}

/* hero */
.hero{padding-top:48px}
.pizza{display:flex;gap:22px;align-items:center;flex-wrap:wrap;margin:22px 0}
.pizza svg{flex:0 0 auto}
.stat-strip{display:grid;grid-template-columns:repeat(auto-fit,minmax(150px,1fr));gap:10px;margin-top:16px}
.stat-strip .card{padding:14px}
.stat-strip .big{font-size:30px}

/* value chain */
.vc{display:grid;grid-template-columns:1fr 64px;gap:0;margin:18px 0 8px}
.vc-body{display:grid;gap:4px}
.vc-support{display:grid;gap:4px}
.vc-sbox{background:var(--support-soft);border:1px solid color-mix(in srgb,var(--support) 40%,transparent);color:var(--ink);border-radius:6px;padding:8px 12px;font-size:14px;font-weight:600;cursor:pointer;text-align:left;font-family:inherit}
.vc-primary{display:grid;grid-template-columns:repeat(5,1fr);gap:4px}
.vc-pbox{background:var(--primary-soft);border:1px solid color-mix(in srgb,var(--primary) 40%,transparent);color:var(--ink);border-radius:6px;padding:10px 6px;min-height:92px;font-size:13px;font-weight:600;cursor:pointer;font-family:inherit;display:flex;flex-direction:column;align-items:center;justify-content:center;text-align:center;gap:4px;position:relative}
.vc-pbox .tag,.vc-sbox .tag{font-size:11px;font-weight:500;color:var(--muted)}
.vc-margin{background:var(--margin-soft);border:1px solid color-mix(in srgb,var(--margin) 50%,transparent);clip-path:polygon(0 0,100% 50%,0 100%);display:flex;align-items:center;padding-left:6px;font-size:11px;font-weight:700;color:var(--ink);cursor:pointer;writing-mode:vertical-rl;transform:rotate(180deg);justify-content:center}
.vc button.sel{outline:3px solid var(--accent);outline-offset:1px}
.vc .deleted{background:repeating-linear-gradient(45deg,var(--surface2),var(--surface2) 6px,var(--surface) 6px,var(--surface) 12px);text-decoration:line-through;color:var(--muted)}
.vc-info{min-height:120px;margin-top:12px}
.vc-labels{display:flex;justify-content:space-between;font-size:12px;color:var(--muted);margin-top:4px}
@media (max-width:620px){
  .vc-primary{grid-template-columns:1fr 1fr}
  .vc-pbox{min-height:64px}
  .vc{grid-template-columns:1fr 40px}
}

/* steps */
.steps{display:grid;gap:10px;margin-top:16px}
.step{display:grid;grid-template-columns:44px 1fr;gap:12px;align-items:start;background:var(--surface);border:1px solid var(--line);border-radius:12px;padding:14px;cursor:pointer}
.step .n{width:36px;height:36px;border-radius:50%;background:var(--ink);color:var(--bg);display:grid;place-items:center;font-weight:800}
.step .more{display:none;margin-top:8px;font-size:15px}
.step.open .more{display:block}
.step .q{font-style:italic;color:var(--accent);margin-top:6px}
.step h4{margin:4px 0 0;font-size:16px}
.chips{display:flex;flex-wrap:wrap;gap:6px;margin-top:10px}
.chip{font-size:13px;padding:5px 11px;border-radius:999px;border:1px solid var(--line);background:var(--surface);cursor:pointer;color:var(--ink);font-family:inherit}
.chip.on{background:var(--accent);color:#fff;border-color:var(--accent)}
.chip.right{background:var(--good);border-color:var(--good);color:#fff}
.chip.wrong{background:var(--warn-soft);border-color:var(--warn)}

/* linkage triangle */
.tri-wrap{display:grid;grid-template-columns:minmax(260px,420px) 1fr;gap:20px;align-items:center}
@media (max-width:720px){.tri-wrap{grid-template-columns:1fr}}
.tri svg{width:100%;height:auto}
.tri .node{cursor:pointer}
.tri .node rect{transition:.25s}
.tri .dim{opacity:.25}

/* tables */
.ex2{display:grid;gap:10px;margin-top:12px}
.ex2 .r{display:grid;grid-template-columns:170px 1fr 1fr;gap:12px;background:var(--surface);border:1px solid var(--line);border-radius:12px;padding:14px}
.ex2 .r .h{font-weight:700;color:var(--primary)}
.ex2 .r .why{color:var(--good)}
@media (max-width:720px){.ex2 .r{grid-template-columns:1fr}}

/* bars */
.bars{display:grid;gap:10px;margin-top:10px}
.bar{display:grid;grid-template-columns:110px 1fr 90px;gap:10px;align-items:center;font-size:14px}
.bar .track{height:22px;background:var(--surface2);border-radius:5px;overflow:hidden}
.bar .fill{height:100%;width:0;border-radius:5px;transition:width .9s cubic-bezier(.2,.8,.2,1)}
.bar .v{font-variant-numeric:tabular-nums;font-weight:700;text-align:right}
.fill.lc{background:var(--accent)}
.fill.dom{background:var(--primary)}
.fill.ph{background:var(--support)}
.fill.pj{background:var(--margin)}
.fill.avg{background:var(--muted)}

/* timeline */
.tl{position:relative;margin:18px 0 6px;padding-left:22px}
.tl:before{content:"";position:absolute;left:7px;top:4px;bottom:4px;width:2px;background:var(--line)}
.tl .e{position:relative;margin-bottom:14px}
.tl .e:before{content:"";position:absolute;left:-20px;top:6px;width:12px;height:12px;border-radius:50%;background:var(--accent)}
.tl .e b{font-variant-numeric:tabular-nums}

/* tabs */
.tabs{display:flex;gap:6px;flex-wrap:wrap;margin:14px 0}
.tabpanel{display:none}
.tabpanel.on{display:block;animation:fade .3s}
@keyframes fade{from{opacity:0;transform:translateY(4px)}to{opacity:1;transform:none}}
.mini-chain{display:flex;gap:3px;margin:10px 0 14px}
.mini-chain span{flex:1;height:10px;border-radius:3px;background:var(--surface2)}
.mini-chain span.hit{background:var(--accent)}
.kpis{display:grid;grid-template-columns:repeat(auto-fit,minmax(140px,1fr));gap:8px;margin:12px 0}
.kpi{background:var(--surface2);border-radius:10px;padding:10px 12px}
.kpi .k{font-size:22px;font-weight:800;font-variant-numeric:tabular-nums}
.kpi .l{font-size:12px;color:var(--muted)}

/* coffee */
.stack{display:flex;height:56px;border-radius:10px;overflow:hidden;margin:14px 0 8px}
.stack div{display:flex;align-items:center;justify-content:center;font-size:12px;font-weight:700;color:#fff;cursor:pointer;transition:filter .2s;text-align:center;line-height:1.1;padding:2px}
.stack div:hover{filter:brightness(1.12)}
.legend{display:flex;flex-wrap:wrap;gap:12px;font-size:13px;color:var(--muted)}
.legend i{display:inline-block;width:10px;height:10px;border-radius:2px;margin-right:5px;vertical-align:-1px}

/* profit pool */
.pp svg{width:100%;height:auto;display:block}
.pp text{fill:var(--ink);font-size:12px}
.pp .axis{stroke:var(--muted)}
.pp .blk{cursor:pointer;transition:opacity .2s}
.pp .blk:hover{opacity:.85}

/* compare */
.vs{display:grid;grid-template-columns:1fr 1fr;gap:0;border:1px solid var(--line);border-radius:12px;overflow:hidden;margin:16px 0}
.vs > div{padding:14px 16px;background:var(--surface)}
.vs > div:nth-child(odd){border-right:1px solid var(--line)}
.vs .hd{background:var(--surface2);font-weight:700}
.vs > div:not(.hd){border-top:1px solid var(--line);font-size:15px}
@media (max-width:560px){.vs{font-size:14px}.vs > div{padding:10px}}

/* quiz */
.quiz .q{margin-bottom:18px}
.quiz .opts{display:grid;gap:6px;margin-top:8px}
.quiz .opt{text-align:left;font:inherit;font-size:15px;padding:10px 12px;border-radius:9px;border:1px solid var(--line);background:var(--surface);color:var(--ink);cursor:pointer}
.quiz .opt:hover{border-color:var(--accent)}
.quiz .opt.right{background:var(--good-soft);border-color:var(--good)}
.quiz .opt.wrong{background:var(--warn-soft);border-color:var(--warn)}
.quiz .fb{display:none;font-size:14px;margin-top:6px;color:var(--muted)}
.quiz .fb.on{display:block}
.score{position:sticky;bottom:12px;float:right;background:var(--ink);color:var(--bg);padding:6px 12px;border-radius:999px;font-weight:700;font-size:14px}

/* cheat */
.cheat{display:grid;grid-template-columns:repeat(auto-fit,minmax(260px,1fr));gap:12px}
.cheat .card h4{margin:0 0 6px;font-size:15px;color:var(--accent)}
.cheat ul{margin:0;padding-left:18px;font-size:14px}
.flip{perspective:900px;cursor:pointer;min-height:150px}
.flip .in{position:relative;width:100%;height:100%;min-height:150px;transition:transform .5s;transform-style:preserve-3d}
.flip.on .in{transform:rotateY(180deg)}
.flip .f,.flip .b{position:absolute;inset:0;backface-visibility:hidden;border-radius:14px;padding:16px;border:1px solid var(--line);display:flex;flex-direction:column;justify-content:center}
.flip .f{background:var(--surface)}
.flip .b{background:var(--ink);color:var(--bg);transform:rotateY(180deg);font-size:14px}
.flip .f b{font-size:17px}
footer{padding:30px 0 60px;color:var(--muted);font-size:13px}
.src{font-size:12px;color:var(--muted);margin-top:6px}
</style>
</head>
<body>
<header class="top">
  <div class="wrap">
    <strong>The Value Chain</strong>
    <nav class="toc" id="toc">
      <a href="#s-hook">Hook</a>
      <a href="#s-porter">Porter</a>
      <a href="#s-missed">Linkages</a>
      <a href="#s-steps">5 steps</a>
      <a href="#s-lc">Little Caesars</a>
      <a href="#s-twist">The twist</a>
      <a href="#s-link">Own one link</a>
      <a href="#s-pools">Profit pools</a>
      <a href="#s-quiz">Quiz</a>
      <a href="#s-cheat">Cheat sheet</a>
    </nav>
    <button id="themeBtn" aria-label="Toggle theme">Theme</button>
  </div>
</header>
<div class="progress" id="prog"></div>

<main class="wrap">

<!-- HOOK -->
<section id="s-hook" class="hero">
  <div class="kicker">STRAT 401 · Reading, without the reading</div>
  <h1>A pizza that cost five dollars, and what it teaches about strategy</h1>
  <p class="lede">A firm doesn't have costs. Activities do. This page walks through the whole reading: Porter's value chain, how to run the analysis, the Little Caesars case and what it hides, firms that win by owning one activity, and profit pools (where the money actually sits).</p>
  <div class="pizza">
    <svg width="120" height="120" viewBox="0 0 120 120" aria-hidden="true">
      <circle cx="60" cy="60" r="54" fill="var(--margin)"/>
      <circle cx="60" cy="60" r="46" fill="var(--accent)" opacity=".85"/>
      <g fill="var(--accent-soft)"><circle cx="45" cy="42" r="7"/><circle cx="75" cy="48" r="7"/><circle cx="52" cy="75" r="7"/><circle cx="80" cy="76" r="6"/><circle cx="62" cy="58" r="6"/></g>
    </svg>
    <div style="flex:1;min-width:240px">
      <p style="margin-top:0">Garden City, Michigan. A pepperoni pizza sits in a warming rack. <b>Nobody has ordered it yet.</b> It was made to a forecast. When a customer walks in, the sale takes about 40 seconds. Price: <b>$5</b>, from 2004 until January 2022.</p>
      <p>The obvious explanation is cheap ingredients, and <b>it's wrong</b>. The $5 pizza came from about a dozen activities, each built to cost less than the same activity at Domino's or Pizza Hut. One of them, the delivery driver, was <b>removed entirely</b>.</p>
    </div>
  </div>
  <div class="callout"><b>The one-sentence takeaway</b>A value chain analysis breaks a firm into the things it actually does, so you can ask three questions of each one: <i>What does it cost us? What drives that cost? Would a buyer notice if we did it differently?</i></div>
</section>

<!-- PORTER -->
<section id="s-porter">
  <div class="kicker">Part 1 · The framework</div>
  <h2>What Porter actually proposed</h2>
  <p>Michael Porter, <i>Competitive Advantage</i> (1985). The usual view, then and now, is that competitive advantage belongs to <b>firms</b>: some are well run and some aren't. Porter's view went further than that: <b>a firm is a collection of separate activities, and it wins or loses in each one on its own.</b></p>
  <p>He grouped the activities into nine generic categories. <b>Click any box</b> to see what it is. Then turn on the Little Caesars overlay.</p>
  <div class="row" style="margin-top:10px">
    <button class="btn on" id="ovGeneric">Generic (Porter)</button>
    <button class="btn" id="ovLC">Little Caesars overlay</button>
  </div>
  <div class="vc" id="vc">
    <div class="vc-body">
      <div class="vc-support" id="vcSupport"></div>
      <div class="vc-primary" id="vcPrimary"></div>
    </div>
    <button class="vc-margin" data-k="margin" aria-label="Margin">MARGIN</button>
  </div>
  <div class="vc-labels"><span><span style="color:var(--support)">■</span> Support activities (4): run across all primary activities</span><span><span style="color:var(--primary)">■</span> Primary (5): touch the product on its way to the buyer</span></div>
  <div class="card vc-info" id="vcInfo"><b>Pick a box.</b><div class="small">The wedge on the right is <b>margin</b>: what's left when the buyer's willingness to pay is higher than the combined cost of every activity to its left.</div></div>
  <p class="src">Adapted from Porter, Competitive Advantage (1985), Ch. 2 (the reading's Exhibit 1).</p>
</section>

<!-- MISSED -->
<section id="s-missed">
  <div class="kicker">Part 2 · Two ideas people usually miss</div>
  <h2>These two matter more than the nine categories</h2>
  <div class="grid2" style="margin-top:14px">
    <div class="card">
      <span class="pill">Idea 1</span>
      <h3 style="margin-top:8px">The boxes are a starting point, not the answer</h3>
      <p>The nine are generic on purpose. The analysis only gets useful once you <b>split an activity whose parts have different economics</b>.</p>
      <ul>
        <li><b>Airline "operations"</b> covers gate turnaround and engine overhaul, which have almost nothing in common.</li>
        <li><b>Little Caesars "marketing &amp; sales"</b> splits into national advertising (a fixed cost paid from a franchise fund) and the menu-board price, which isn't a cost at all. It's a promise.</li>
      </ul>
      <div class="callout warn" style="margin:8px 0 0"><b>Test</b>If every activity in your chain has the same cost driver, you haven't split them finely enough.</div>
    </div>
    <div class="card">
      <span class="pill">Idea 2</span>
      <h3 style="margin-top:8px">Advantage can sit <i>between</i> the boxes: linkages</h3>
      <p>A <b>linkage</b> exists when the cost or effectiveness of one activity depends on how another one is done. It's the least-used part of the framework.</p>
      <div id="linkDemo"></div>
      <p class="small" style="margin-top:10px"><b>Why linkages are hard to copy:</b> a rival can see most single activities (store layouts, shelf prices, job postings, patents). What it can't easily see is <b>which activity is subsidizing which</b>.</p>
    </div>
  </div>

  <h3>Case: Amazon's 2023 network redesign</h3>
  <p>Amazon split the US into <b>8 largely self-sufficient regions</b>. Drag the slider to compare before and after.</p>
  <div class="card">
    <div class="row" style="justify-content:space-between"><span class="small">Before</span><input type="range" min="0" max="100" value="0" id="amzSlider" style="flex:1;margin:0 12px" aria-label="Before/after slider"><span class="small">After</span></div>
    <div class="kpis" id="amzKpis"></div>
    <div class="callout good" style="margin-bottom:0"><b>The point</b>No single activity got cheaper. <b>The relationships between activities changed.</b> It was Amazon's first cost-per-unit reduction since 2018.</div>
  </div>
</section>

<!-- STEPS -->
<section id="s-steps">
  <div class="kicker">Part 3 · Method</div>
  <h2>How to run a value chain analysis in five steps</h2>
  <p>The framework only describes. The analysis has to produce something you can act on. Each step goes wrong in a predictable way if you skip its questions. <b>Click a step to open it.</b></p>
  <div class="steps" id="steps"></div>

  <h3>Porter's 10 cost drivers: practice</h3>
  <p class="small">Don't assume scale explains everything. Go through the drivers one at a time. Read the scenario and pick the driver that fits best.</p>
  <div class="card">
    <div id="drvScenario" style="font-weight:600;min-height:48px"></div>
    <div class="chips" id="drvChips"></div>
    <div id="drvFb" class="small" style="margin-top:10px;min-height:22px"></div>
    <div class="row" style="justify-content:space-between;margin-top:6px"><span class="small" id="drvCount"></span><button class="btn" id="drvNext">Next scenario →</button></div>
  </div>
</section>

<!-- LITTLE CAESARS -->
<section id="s-lc">
  <div class="kicker">Part 4 · Case</div>
  <h2>Little Caesars: a low cost position built one activity at a time</h2>
  <p>Its cost advantage isn't concentrated in one place. It's <b>spread across the chain</b> in small, deliberate decisions that reinforce each other.</p>
  <div class="ex2" id="ex2"></div>

  <div class="callout"><b>The real savings come from what it doesn't do at all</b>No taking orders before making pizza. No drivers. At the Portal, no staffed counter. <b>Removing an activity is the most reliable cost cut available</b>, because the other option, doing the activity more cheaply than a rival, invites the rival to respond.</div>

  <h3>The linkage triangle: why "just sell a cheaper pizza" doesn't work</h3>
  <div class="tri-wrap">
    <div class="tri card" style="padding:10px">
      <svg viewBox="0 0 400 330" id="triSvg" role="img" aria-label="Three reinforcing activities">
        <defs><marker id="ah" viewBox="0 0 10 10" refX="9" refY="5" markerWidth="7" markerHeight="7" orient="auto-start-reverse"><path d="M0,0L10,5L0,10z" fill="var(--muted)"/></marker></defs>
        <g id="triEdges" stroke="var(--muted)" stroke-width="2" fill="none" marker-end="url(#ah)">
          <path data-e="a" d="M170,78 L95,215"/>
          <path data-e="b" d="M140,262 L262,262"/>
          <path data-e="c" d="M305,215 L232,78"/>
        </g>
        <g font-size="11" fill="var(--muted)" text-anchor="middle">
          <text x="100" y="140" transform="rotate(-61 100 140)">needs</text>
          <text x="200" y="282">needs</text>
          <text x="300" y="140" transform="rotate(61 300 140)">needs</text>
        </g>
        <g class="node" data-n="made"><rect x="120" y="22" width="160" height="56" rx="10" fill="var(--primary-soft)" stroke="var(--primary)"/><text x="200" y="46" text-anchor="middle" font-weight="700" font-size="14" fill="var(--ink)">Made-ahead</text><text x="200" y="64" text-anchor="middle" font-size="12" fill="var(--muted)">production</text></g>
        <g class="node" data-n="menu"><rect x="10" y="225" width="150" height="56" rx="10" fill="var(--support-soft)" stroke="var(--support)"/><text x="85" y="249" text-anchor="middle" font-weight="700" font-size="14" fill="var(--ink)">Narrow menu</text><text x="85" y="267" text-anchor="middle" font-size="12" fill="var(--muted)">4 products, not 40</text></g>
        <g class="node" data-n="price"><rect x="240" y="225" width="150" height="56" rx="10" fill="var(--accent-soft)" stroke="var(--accent)"/><text x="315" y="249" text-anchor="middle" font-weight="700" font-size="14" fill="var(--ink)">Low price</text><text x="315" y="267" text-anchor="middle" font-size="12" fill="var(--muted)">$5 Hot-N-Ready</text></g>
        <text x="200" y="318" text-anchor="middle" font-size="12" fill="var(--muted)" id="triHint">Click a node to remove it</text>
      </svg>
    </div>
    <div id="triText" class="card">
      <p style="margin-top:0"><b>Each one only works because of the others:</b></p>
      <ul>
        <li><b>Made-ahead production needs a narrow menu.</b> Forecasting four products is manageable. Forecasting forty isn't.</li>
        <li><b>A narrow menu needs a low price.</b> Buyers demand variety when the price is high.</li>
        <li><b>A low price needs high throughput per labor hour</b>, which is exactly what made-ahead production delivers.</li>
      </ul>
      <p class="small" style="margin-bottom:0">Pull out any one and the other two stop making sense. That's a chain in Porter's sense.</p>
    </div>
  </div>
</section>

<!-- TWIST -->
<section id="s-twist">
  <div class="kicker">Part 5 · Read the numbers under the diagram</div>
  <h2>The twist: where the cost went out vs. who kept it</h2>
  <p>The usual story is "Little Caesars is cheap, so it wins." The numbers tell a different story. <b>Toggle each metric.</b></p>
  <div class="row" id="ex3Tabs"></div>
  <div class="card" style="margin-top:10px">
    <div id="ex3Title" style="font-weight:700"></div>
    <div class="bars" id="ex3Bars"></div>
    <p id="ex3Note" style="margin-bottom:0"></p>
  </div>
  <p class="src">Reading's Exhibit 3: AUVs from QSR 50 (Aug 2026, FY2025; Little Caesars figure is a QSR estimate); fees and investment from 2025 FDD summaries. Only figures stated in the reading are shown.</p>

  <h3>Same vertical integration, opposite governance</h3>
  <div class="vs">
    <div class="hd">Domino's</div><div class="hd">Little Caesars</div>
    <div>22 regional dough manufacturing and supply chain centers in the US</div><div>Blue Line Foodservice Distribution (owned by the Ilitch family, early 1970s)</div>
    <div>Franchisees are <b>not required</b> to buy from it</div><div>Franchisees are <b>required</b> to buy nearly all food, packaging, supplies and equipment from it</div>
    <div>Franchisees that buy everything get <b>50% of the supply chain's pre-tax profit</b></div><div>No profit share disclosed. Franchisees bought <b>$1.64B</b> through it in FY2021</div>
    <div>Has to <b>win franchisees' business on price</b> every year</div><div><b>Doesn't</b> have to</div>
  </div>

  <h3>The price advantage has narrowed</h3>
  <div class="tl">
    <div class="e"><b>2004</b>: $5 Hot-N-Ready. One number: no coupon, no wait, no decision. It held for 18 years.</div>
    <div class="e"><b>Jan 2022</b>: rises to <b>$5.55</b> (with 33% more pepperoni). No national price announced since.</div>
    <div class="e"><b>Now</b>: third-party menu trackers put it near <b>$6.79</b>. Meanwhile Domino's keeps running a "Best Deal Ever": any pizza, any toppings, $9.99.</div>
    <div class="e"><b>July 2025</b>: Little Caesars launches its <b>first-ever value menu at $9.99, online only</b>. Its CMO said the company sets trends rather than following them, but <b>it was following</b>. Online-only also moves the offer away from the walk-in, no-wait mechanic the whole cost chain was built to serve.</div>
  </div>

  <div class="callout good"><b>Still impressive, just a different story</b>Little Caesars really did remove drivers, order-taking, counter labor, menu complexity and square footage. Net US units grew by <b>93</b> in 2025 while the category shrank (limited-service pizza −0.3%, Little Caesars +1.4%). But a large share of the savings was <b>captured by the franchisor</b> through the required supplier and the highest fee load in the category, not passed fully to operators or customers.</div>
  <div class="callout"><b>The lesson to remember</b>A value chain analysis tells you <b>where the cost went out</b>. It doesn't tell you <b>who kept it</b>. Ask both questions.</div>
</section>

<!-- OWN ONE LINK -->
<section id="s-link">
  <div class="kicker">Part 6 · The opposite strategy</div>
  <h2>Own one link</h2>
  <p>Little Caesars does nearly the whole chain cheaply. The alternative is to take <b>one activity</b> and do it so far beyond everyone else that the rest of the industry has to come to you. Pick a firm.</p>
  <div class="tabs" id="linkTabs"></div>
  <div id="linkPanels"></div>
</section>

<!-- PROFIT POOLS -->
<section id="s-pools">
  <div class="kicker">Part 7 · Where the money sits</div>
  <h2>Profit pools</h2>
  <p>If activities have different economics, then somewhere along every chain there's a place where the money collects.</p>

  <div class="card">
    <h3 style="margin-top:0">The U-Haul story (late 1990s)</h3>
    <div class="grid2">
      <div>
        <p style="margin-top:0">U-Haul rented trucks for less than anyone else. It earned a <b>10% operating margin</b> while the consumer truck-rental industry earned <b>under 3%</b>. But the trucks weren't where the money was.</p>
        <p>The money was in <b>boxes, tape, insurance, hitches and storage</b>, which customers buy <i>after</i> signing the rental agreement, once they've stopped comparison shopping.</p>
      </div>
      <div>
        <div class="bars">
          <div class="bar"><span>U-Haul</span><div class="track"><div class="fill lc" data-w="100"></div></div><span class="v">10%</span></div>
          <div class="bar"><span>Industry</span><div class="track"><div class="fill avg" data-w="29"></div></div><span class="v">&lt;3%</span></div>
        </div>
        <p class="small">Operating margin. U-Haul kept rental rates low <b>on purpose</b>: the low-margin activity was how it acquired customers for the high-margin one.</p>
      </div>
    </div>
  </div>

  <h3>Where the idea comes from</h3>
  <p>Orit Gadiesh &amp; James Gilbert, two <i>Harvard Business Review</i> articles (1998). An industry's <b>profit pool</b> is the total profit earned at every point along its value chain. The key claim: <b>where profit concentrates in an industry is often very different from where revenue concentrates.</b></p>

  <div class="vs">
    <div class="hd">Value chain analysis</div><div class="hd">Profit pool map</div>
    <div>Built from <b>your own general ledger</b></div><div>Built from <b>industry filings</b></div>
    <div>Tells you where <b>your costs</b> are</div><div>Tells you where <b>everyone's profits</b> are</div>
    <div>An <b>efficiency</b> tool: how do we do this activity better?</div><div>A <b>positioning</b> tool: are we standing in the right part of the chain at all?</div>
  </div>

  <h3>How to map one (Gadiesh &amp; Gilbert's four steps)</h3>
  <div class="grid2">
    <div class="card"><span class="pill">1</span> <b>Define the pool's boundaries.</b> Where does the chain start and end? <span class="small">This step determines the answer, and no one has offered a principle for drawing the line.</span></div>
    <div class="card"><span class="pill">2</span> <b>Estimate the pool's total size.</b> <span class="small">Total <i>profit</i>, not revenue, across every activity inside the boundary.</span></div>
    <div class="card"><span class="pill">3</span> <b>Estimate each activity's share.</b> <span class="small">The hard step: activity-level margins are almost never disclosed. You rebuild them from comparable single-business companies and by triangulating.</span></div>
    <div class="card"><span class="pill">4</span> <b>Check and reconcile.</b> <span class="small">The reading's dry point: a method that spends a quarter of its steps on reconciliation was written by people who knew the numbers wouldn't tie out.</span></div>
  </div>

  <h3>Example: where a €9.71 kilogram of coffee goes</h3>
  <p class="small">Germany, 2021 data. Hover or tap a segment.</p>
  <div class="stack" id="coffee"></div>
  <div class="legend" id="coffeeLeg"></div>
  <div class="card" id="coffeeInfo" style="margin-top:10px">Roasting and retail take 22% each, which people expect. <b>The German excise tax takes 23%</b>, which they don't, and it's a warning against generalizing: a US breakdown wouldn't include that tax. The study's conclusion: farmer prices are <b>disconnected</b> from consumer prices, and value concentrates <b>between the importer and the retailer</b>.</div>
  <p class="src">BASIC, The Grounds for Sharing (2024). Shares are modeled, not audited. The reading only states cultivation, roasting, retail and tax. The grey block is everything else, shown as the remainder.</p>

  <div class="callout warn"><b>The iPhone needs a warning label</b>The commonly cited Kraemer, Linden &amp; Dedrick study (Apple captures 58% of an iPhone 4's price as profit, versus about 2% for direct labor in China) uses <b>2010 data</b>. It also isn't a full breakdown of the retail dollar, because carriers paid Apple at the time rather than buyers paying through retail.</div>

  <h3>How a profit pool is drawn: inside a car dealership (AutoNation 2025)</h3>
  <p>The convention: <b>x-axis = share of revenue</b>, <b>y-axis = margin</b>, so <b>the area of each block = profit</b>. A tall, narrow block is a small, rich activity. A wide, flat one is a large, poor one. Click a block.</p>
  <div class="row"><button class="btn on" id="ppRev">Show it as a profit pool</button><button class="btn" id="ppShare">Revenue share vs. gross profit share</button></div>
  <div class="card pp" style="margin-top:10px"><div id="ppChart"></div><div id="ppInfo" class="small" style="margin-top:6px">AutoNation sold $27.6B of vehicles, parts and service and earned $4.9B of gross profit.</div></div>
  <p class="src">AutoNation FY2025 results. New vehicles and parts &amp; service are from the reading. F&amp;I is derived (22.8% − 17.5%; 77.2% − 47.6%). "Used vehicles &amp; other" is the remainder. Block heights are gross margin, computed as (GP share ÷ revenue share) × the company's 17.8% overall gross margin.</p>
  <div class="callout"><b>The headline</b>Finance &amp; insurance plus parts &amp; service, the two smallest revenue lines at <b>22.8% of sales</b>, produced <b>77.2% of gross profit</b>. New cars were nearly half the revenue (48.9%) but only 13.4% of gross profit.</div>

  <h3>Three more pools, quickly</h3>
  <div class="grid3">
    <div class="card">
      <span class="pill">An airline that's really a credit card</span>
      <div class="big" style="margin-top:10px;color:var(--accent)">141%</div>
      <p class="small">Delta 2025: $63.4B revenue, $5.8B operating income. The American Express SkyMiles payment alone was <b>$8.2B</b> (+11%), equal to <b>12.9% of revenue and 141% of operating income</b>. Delta took in more from one card partnership than it earned, net, from everything it does.</p>
      <div class="bars"><div class="bar" style="grid-template-columns:70px 1fr 50px"><span class="small">Op. inc.</span><div class="track"><div class="fill dom" data-w="71"></div></div><span class="v">$5.8B</span></div><div class="bar" style="grid-template-columns:70px 1fr 50px"><span class="small">Amex</span><div class="track"><div class="fill lc" data-w="100"></div></div><span class="v">$8.2B</span></div></div>
    </div>
    <div class="card">
      <span class="pill">A phone business that's one firm</span>
      <div class="big" style="margin-top:10px;color:var(--accent)">85%</div>
      <p class="small">Apple shipped about <b>a fifth</b> of the world's smartphones in 2025, took <b>49%</b> of industry revenue in Q2 2026, and the last published figure for its share of <b>industry operating profit is 85%</b> (from 2023).</p>
      <div class="bars"><div class="bar" style="grid-template-columns:70px 1fr 50px"><span class="small">Units</span><div class="track"><div class="fill avg" data-w="20"></div></div><span class="v">~20%</span></div><div class="bar" style="grid-template-columns:70px 1fr 50px"><span class="small">Revenue</span><div class="track"><div class="fill dom" data-w="49"></div></div><span class="v">49%</span></div><div class="bar" style="grid-template-columns:70px 1fr 50px"><span class="small">Profit</span><div class="track"><div class="fill lc" data-w="85"></div></div><span class="v">85%</span></div></div>
    </div>
    <div class="card">
      <span class="pill">A hotel industry that's a website</span>
      <div class="big" style="margin-top:10px;color:var(--accent)">2×+</div>
      <p class="small">Booking Holdings handled $186.1B of travel, kept $26.9B as revenue and earned <b>$8.825B</b> of operating income without owning a single room. Marriott, the world's biggest hotel company, earned <b>$4.141B</b>. Hotel <b>owners</b>, who carry the property, the debt and the cycle, have the shallowest pool per dollar of capital.</p>
      <div class="bars"><div class="bar" style="grid-template-columns:70px 1fr 50px"><span class="small">Booking</span><div class="track"><div class="fill lc" data-w="100"></div></div><span class="v">$8.8B</span></div><div class="bar" style="grid-template-columns:70px 1fr 50px"><span class="small">Marriott</span><div class="track"><div class="fill dom" data-w="47"></div></div><span class="v">$4.1B</span></div></div>
    </div>
  </div>

  <h3>Back to the warming rack</h3>
  <p>The $5 pizza was never about cheap cheese. It came from a chain with <b>no drivers, no order-takers, no counter transaction, a required distributor, four products instead of forty, 1,400 square feet instead of 3,000, and a forecast instead of an order ticket</b>. Each of those is an activity someone else performs and Little Caesars doesn't.</p>
  <p>A chain also changes over time. The price is no longer $5. The value menu now matches a competitor's price instead of setting it. The franchisor kept much of the savings. The rival that once had the expensive chain rebuilt it around carryout. <b>None of that showed up in the diagram. It showed up in the numbers underneath it.</b></p>
  <div class="callout"><b>The closing question</b>Draw your own chain, not the generic nine, split until each box has its own economics. Put a real cost and a real asset against each one. Then ask: <i>if you could defend only one of these activities to the last dollar, which would it be, and is it the one you're funding?</i></div>
</section>

<!-- QUIZ -->
<section id="s-quiz">
  <div class="kicker">Check yourself</div>
  <h2>Quiz</h2>
  <p class="small">Click an answer. You'll see the explanation right away.</p>
  <div class="quiz" id="quiz"></div>
  <span class="score" id="score">0 / 0</span>
  <div style="clear:both"></div>
</section>

<!-- CHEAT -->
<section id="s-cheat">
  <div class="kicker">Cheat sheet</div>
  <h2>Everything on one screen</h2>
  <div class="cheat">
    <div class="card"><h4>Core idea</h4><ul><li>A firm has no costs. Activities do.</li><li>9 generic activities: 5 primary (inbound, operations, outbound, marketing &amp; sales, service) and 4 support (infrastructure, HR, technology development, procurement).</li><li>Margin = buyer's willingness to pay − total activity cost.</li></ul></div>
    <div class="card"><h4>Two ideas people miss</h4><ul><li>Split until the parts have different economics.</li><li>Linkages: one activity's cost depends on another's. They're hard to copy because they can't be observed.</li><li>Amazon's regions: no single activity got cheaper.</li></ul></div>
    <div class="card"><h4>5-step analysis</h4><ul><li>1 Split up activities</li><li>2 Cost + assets for each box</li><li>3 Cost drivers (10 of them)</li><li>4 Work the linkages, including suppliers and channels</li><li>5 Own / buy / ride on someone else's brand</li></ul></div>
    <div class="card"><h4>10 cost drivers</h4><ul><li>Scale · learning · capacity utilization · linkages · interrelationships across business units · vertical integration · timing of entry · discretionary policy choices · location · institutional factors</li></ul></div>
    <div class="card"><h4>Little Caesars</h4><ul><li>Removing activities beats doing them cheaper.</li><li>Made-ahead ↔ narrow menu ↔ low price.</li><li>But: AUV ~69% of Domino's, 11% fees vs 9.5%, investment floor 4×, ACSI last.</li><li>Ask where the cost went out <i>and</i> who kept it.</li></ul></div>
    <div class="card"><h4>Own one link</h4><ul><li>Inbound: ASML (only EUV maker, Zeiss stake)</li><li>Operations: TSMC (promise not to compete with customers), YKK (leased machines, brand on the customer's product)</li><li>Outbound: Amazon (cost center → sold as a product)</li><li>Service: Ritz-Carlton ($2,000 discretion per employee)</li></ul></div>
    <div class="card"><h4>Profit pools</h4><ul><li>Gadiesh &amp; Gilbert 1998: profit ≠ revenue concentration.</li><li>Value chain = efficiency. Profit pool = positioning.</li><li>Chart: x = revenue share, y = margin, area = profit.</li><li>4 steps: boundaries, size, shares, reconcile.</li></ul></div>
    <div class="card"><h4>Pool examples</h4><ul><li>U-Haul: cheap trucks, profitable boxes</li><li>Coffee: 21% to farming, 23% tax (Germany)</li><li>AutoNation: 22.8% of revenue → 77.2% of gross profit</li><li>Delta Amex = 141% of op. income; Apple 85% of profit; Booking > 2× Marriott</li></ul></div>
  </div>

  <h3>Flashcards</h3>
  <div class="grid3" id="flash"></div>
</section>

<footer>Built from the STRAT 401 reading "The Value Chain." Figures are as stated in the reading (current as of mid-September 2026). Derived values are labeled where they appear.</footer>
</main>

<script>
(function(){
const $=s=>document.querySelector(s), $$=s=>Array.from(document.querySelectorAll(s));

/* theme */
const root=document.documentElement;
$('#themeBtn').onclick=()=>{
  const dark = root.dataset.theme ? root.dataset.theme==='dark' : matchMedia('(prefers-color-scheme: dark)').matches;
  root.dataset.theme = dark ? 'light':'dark';
};

/* progress + toc */
const secs=$$('main section');
addEventListener('scroll',()=>{
  const h=document.documentElement; $('#prog').style.width=(h.scrollTop/(h.scrollHeight-h.clientHeight)*100)+'%';
  let cur=secs[0].id; secs.forEach(s=>{if(s.getBoundingClientRect().top<120)cur=s.id});
  $$('#toc a').forEach(a=>a.classList.toggle('on',a.getAttribute('href')==='#'+cur));
},{passive:true});

/* animate bars on view */
const io=new IntersectionObserver(es=>es.forEach(e=>{if(e.isIntersecting){e.target.querySelectorAll('.fill[data-w]').forEach(f=>f.style.width=f.dataset.w+'%');}}),{threshold:.2});
const watchBars=()=>$$('.bars').forEach(b=>io.observe(b));

/* VALUE CHAIN */
const support=[
  {k:'infra',n:'Firm infrastructure',d:'General management, planning, finance, accounting, legal. Supports the entire chain rather than any one activity.'},
  {k:'hr',n:'Human resource management',d:'Recruiting, hiring, training, pay. At the Ritz-Carlton, first-year employees got 250 to 310 hours of training.'},
  {k:'tech',n:'Technology development',d:'R&D, process and product engineering. The reading notes almost no firm can put a real cost against technology development, which is why the surprises tend to be there.'},
  {k:'proc',n:'Procurement',d:'The function of buying the inputs used across the chain. Like technology development, firms rarely know what it actually costs them.'}
];
const primary=[
  {k:'in',n:'Inbound logistics',d:'Receiving, storing and distributing inputs. Linkage example: spend more on inbound inspection and you spend less on rework later. Own-one-link example: ASML.'},
  {k:'ops',n:'Operations',d:'Turning inputs into the product. It often needs splitting. At an airline, gate turnaround and engine overhaul are both "operations" but have almost nothing in common. Own-one-link examples: TSMC, YKK.'},
  {k:'out',n:'Outbound logistics',d:'Getting the finished product to buyers: warehousing, order fulfillment, delivery. Own-one-link example: Amazon.'},
  {k:'mkt',n:'Marketing & sales',d:'Getting buyers to buy: advertising, pricing, channels. At Little Caesars it splits into a fixed-cost ad fund and a price that is a promise rather than a cost.'},
  {k:'svc',n:'Service',d:'Keeping or improving the product\'s value after the sale. Own-one-link example: the Ritz-Carlton.'}
];
const lc={
  proc:{t:'Blue Line (required supplier)',d:'An Ilitch-owned distributor founded in the early 1970s is the required supplier for nearly all food, packaging, supplies and primary equipment. Pepsi is the exclusive beverage supplier. One captive distributor, one truck, one negotiation. Franchisees bought $1.64B through it in FY2021.'},
  in:{t:'Blue Line trucks',d:'One captive distributor means one truck and one negotiation. (The reading puts inbound logistics and procurement in the same row.)'},
  ops:{t:'Made to forecast',d:'Pizza is made to a forecast and held in a warming rack, not made to order. Narrow menu. Stores are 1,200–1,600 sq ft; a newer modular format is just over 1,000 sq ft and opens in about 90 days. Ovens run continuously at high utilization. Less space, rent, equipment, training and energy.'},
  out:{t:'Delivery driver: removed',d:'Carryout only from 1959 to 2019. Delivery, when it came, was handled by DoorDash Drive, not an owned fleet. The Pizza Portal (a heated self-service locker, nationwide since Sept 2018) skips the counter entirely. No drivers on payroll, no vehicle insurance, no driver scheduling risk.',del:true},
  mkt:{t:'One number: $5',d:'For 18 years the offer was a single number: $5, Hot-N-Ready, no coupon, no wait, no decision. A price that needs no explanation is cheaper to communicate than an offer that does.'},
  svc:{t:'Order-taking & counter: removed',d:'It doesn\'t take orders before making pizza, and at the Portal there\'s no counter transaction. Removed activities cost nothing.',del:true}
};
let overlay='generic', sel=null;
function renderVC(){
  $('#vcSupport').innerHTML=support.map(s=>{
    const o=overlay==='lc'&&lc[s.k];
    return `<button class="vc-sbox ${sel===s.k?'sel':''}" data-k="${s.k}">${s.n}${o?` <span class="tag">→ ${o.t}</span>`:''}</button>`;
  }).join('');
  $('#vcPrimary').innerHTML=primary.map(p=>{
    const o=overlay==='lc'&&lc[p.k];
    return `<button class="vc-pbox ${sel===p.k?'sel':''} ${o&&o.del?'deleted':''}" data-k="${p.k}">${p.n}${o?`<span class="tag">${o.t}</span>`:''}</button>`;
  }).join('');
  $$('#vc button').forEach(b=>b.onclick=()=>{sel=b.dataset.k;renderVC();info();});
  $('.vc-margin').classList.toggle('sel',sel==='margin');
}
function info(){
  if(sel==='margin'){$('#vcInfo').innerHTML='<b>Margin</b><p style="margin:4px 0 0">What\'s left when the buyer\'s willingness to pay is higher than the combined cost of every activity to its left. Little Caesars shows a catch: the margin a <i>franchisee</i> keeps also depends on fees and required purchases, which go to the franchisor.</p>';return;}
  const all=[...support,...primary].find(x=>x.k===sel); if(!all)return;
  const o=overlay==='lc'&&lc[sel];
  $('#vcInfo').innerHTML=`<b>${all.n}</b> <span class="pill">${support.includes(all)?'Support':'Primary'}</span><p style="margin:6px 0 0">${all.d}</p>`+(o?`<div class="callout ${o.del?'good':''}" style="margin:10px 0 0"><b>Little Caesars: ${o.t}</b>${o.d}</div>`:(overlay==='lc'?'<p class="small">The reading doesn\'t detail Little Caesars here.</p>':''));
}
$('#ovGeneric').onclick=()=>{overlay='generic';$('#ovGeneric').classList.add('on');$('#ovLC').classList.remove('on');renderVC();info();};
$('#ovLC').onclick=()=>{overlay='lc';$('#ovLC').classList.add('on');$('#ovGeneric').classList.remove('on');renderVC();info();};
renderVC();

/* linkage demo */
const links=[
  ['More inbound inspection','Less rework'],
  ['More inventory held','Less expediting'],
  ['Part designed to snap, not bolt','Shorter assembly']
];
$('#linkDemo').innerHTML=links.map(([a,b])=>`<div style="display:grid;grid-template-columns:1fr 34px 1fr;align-items:center;gap:6px;margin:6px 0;font-size:14px"><span class="pill" style="background:var(--warn-soft);color:var(--ink);text-align:center">↑ ${a}</span><span style="text-align:center;color:var(--muted)">⟶</span><span class="pill" style="background:var(--good-soft);color:var(--ink);text-align:center">↓ ${b}</span></div>`).join('');

/* amazon */
const amz=[
  {l:'Share of orders fulfilled in-region',a:62,b:76,f:v=>Math.round(v)+'%'},
  {l:'Distance site → customer',a:100,b:85,f:v=>(v-100===0?'baseline':Math.round(v-100)+'%')},
  {l:'Middle-mile touch points',a:100,b:88,f:v=>(v-100===0?'baseline':Math.round(v-100)+'%')},
  {l:'US cost per unit',a:0,b:.45,f:v=>v===0?'baseline':'−$'+v.toFixed(2)+'+'}
];
function amzR(){
  const t=$('#amzSlider').value/100;
  $('#amzKpis').innerHTML=amz.map(m=>{const v=m.a+(m.b-m.a)*t;return `<div class="kpi"><div class="k">${m.f(v)}</div><div class="l">${m.l}</div></div>`}).join('');
}
$('#amzSlider').oninput=amzR; amzR();

/* steps */
const steps=[
  {t:'Disaggregate until the activities have different economics',d:'Keep splitting while the parts have different cost drivers, different assets, or different effects on what a buyer will pay. Stop when they don\'t.',q:'Which activities have truly different cost behavior? Which are a large or growing share of cost? Which does the buyer actually notice?'},
  {t:'Put a cost and an asset against every box',d:'Most firms can do this for the plant. Almost none can for procurement or technology development, which is exactly why those are where the surprises are. Include assets employed: an activity that is cheap to run but ties up working capital isn\'t cheap.',q:'If we had to sell this activity as a standalone business tomorrow, what would its income statement look like?'},
  {t:'Ask what drives cost in each box',d:'Porter names 10 drivers. Go through them one at a time rather than assuming the answer is scale: scale, learning, capacity utilization, linkages, interrelationships across business units, vertical integration, timing of entry, discretionary policy choices, location, institutional factors (regulation, union status).',q:'Is our cost here driven by how much we do, how long we\'ve done it, or just a policy someone set in 1998?'},
  {t:'Work the linkages, not the boxes',d:'Look for pairs where spending more in one place saves more in another. Look for the reverse too: local optimizations that push cost downstream. This is also where you look outside the firm, at vertical linkages to suppliers\' and channels\' chains.',q:'Whose budget absorbs the cost of our choice, and does that person know?'},
  {t:'Decide what to own, what to buy, and what to let someone else\'s brand ride on',d:'The chain is a map of make-or-buy decisions that were mostly made by accident. Revisit them on purpose.',q:'Which of these activities would we defend to the last dollar, and which are we doing only because we always have?'}
];
$('#steps').innerHTML=steps.map((s,i)=>`<div class="step ${i===0?'open':''}"><div class="n">${i+1}</div><div><h4>${s.t}</h4><div class="more">${s.d}<div class="q">Ask: ${s.q}</div></div></div></div>`).join('');
$$('.step').forEach(s=>s.onclick=()=>s.classList.toggle('open'));

/* cost drivers game */
const drivers=['Scale','Learning','Capacity utilization','Linkages','Interrelationships','Vertical integration','Timing of entry','Discretionary policy','Location','Institutional factors'];
const scen=[
  {s:'Little Caesars ovens run continuously instead of idling between orders.',a:'Capacity utilization',w:'The same fixed oven gets used more of the time, so cost per pizza falls.'},
  {s:'A store\'s labor cost is set mainly by a union contract.',a:'Institutional factors',w:'Regulation and union status are institutional drivers.'},
  {s:'Little Caesars owns Blue Line, the distributor its franchisees must buy from.',a:'Vertical integration',w:'Owning an upstream stage of the chain.'},
  {s:'A rule written in 1998 still requires a costly approval step on every order.',a:'Discretionary policy',w:'Someone chose it, and it can be changed. The reading\'s step-3 question asks about exactly this.'},
  {s:'Amazon cuts cost per unit by redesigning how its fulfillment sites relate to each other, without making any one site cheaper.',a:'Linkages',w:'The relationships between activities changed.'},
  {s:'A factory\'s defect cost falls every year because its crews have done the job for a decade.',a:'Learning',w:'Cost driven by how long you\'ve done it, not by how much.'},
  {s:'Amazon\'s network moves sites closer to customers, cutting distance by 15%.',a:'Location',w:'Where activities physically sit drives their cost.'},
  {s:'A distribution network\'s fixed costs are spread over more stores as the chain grows.',a:'Scale',w:'How much you do. The reading warns not to assume it\'s the answer every time.'}
];
let si=0, done=0, right=0, answered=false;
function drvR(){
  answered=false; const sc=scen[si];
  $('#drvScenario').textContent=sc.s; $('#drvFb').textContent='';
  $('#drvChips').innerHTML=drivers.map(d=>`<button class="chip">${d}</button>`).join('');
  $('#drvCount').textContent=`Scenario ${si+1} of ${scen.length} · ${right}/${done} correct`;
  $$('#drvChips .chip').forEach(c=>c.onclick=()=>{
    if(answered)return; answered=true; done++;
    const ok=c.textContent===sc.a; if(ok)right++;
    c.classList.add(ok?'right':'wrong');
    if(!ok)$$('#drvChips .chip').find(x=>x.textContent===sc.a).classList.add('right');
    $('#drvFb').innerHTML=(ok?'<b style="color:var(--good)">Correct.</b> ':'<b style="color:var(--warn)">Best fit: '+sc.a+'.</b> ')+sc.w;
    $('#drvCount').textContent=`Scenario ${si+1} of ${scen.length} · ${right}/${done} correct`;
  });
}
$('#drvNext').onclick=()=>{si=(si+1)%scen.length;drvR();}; drvR();

/* exhibit 2 */
const ex2=[
  ['Inbound logistics & procurement','Blue Line Foodservice Distribution, owned by the Ilitch family, is the required supplier for nearly all food, packaging, supplies and primary equipment. Pepsi is the exclusive beverage supplier.','One captive distributor, one truck, one negotiation. $1.64B in franchisee purchases in FY2021.'],
  ['Operations','Made to a forecast and held in a warming rack. Narrow menu. 1,200–1,600 sq ft stores; a modular format just over 1,000 sq ft opens in about 90 days.','Ovens run continuously at high utilization. Less space, rent, equipment, training and energy.'],
  ['Outbound logistics','Carryout only from 1959 to 2019. Delivery later through DoorDash Drive. Pizza Portal heated lockers since Sept 2018.','No drivers on payroll, no vehicle insurance, no driver scheduling risk. With the Portal, no counter transaction.'],
  ['Marketing & sales','For 18 years, one number: $5, Hot-N-Ready, no coupon, no wait, no decision.','A price that needs no explanation is cheaper to communicate than an offer that does.']
];
$('#ex2').innerHTML='<div class="r small" style="background:transparent;border:0;padding:0 14px"><b>Activity</b><b>What Little Caesars does</b><b>Why it costs less</b></div>'+ex2.map(r=>`<div class="r"><div class="h">${r[0]}</div><div>${r[1]}</div><div class="why">${r[2]}</div></div>`).join('');

/* triangle */
const triMsg={
  made:'<b>Remove made-ahead production</b>, and low prices lose the throughput per labor hour that paid for them. The narrow menu becomes a limitation with no cost benefit behind it.',
  menu:'<b>Remove the narrow menu</b>, and forecasting forty products is unmanageable, so made-ahead production breaks: either waste or empty racks.',
  price:'<b>Remove the low price</b>, and buyers paying more expect variety. The narrow menu becomes a weakness, and you lose the volume made-ahead production needs.'
};
let triOff=null; const triOrig=$('#triText').innerHTML;
$$('#triSvg .node').forEach(n=>n.onclick=()=>{
  const k=n.dataset.n;
  if(triOff===k){triOff=null;$$('#triSvg .node, #triEdges path').forEach(x=>x.classList.remove('dim'));$('#triText').innerHTML=triOrig;$('#triHint').textContent='Click a node to remove it';return;}
  triOff=k;
  $$('#triSvg .node').forEach(x=>x.classList.toggle('dim',x.dataset.n===k));
  $$('#triEdges path').forEach(p=>p.classList.add('dim'));
  $('#triText').innerHTML='<p style="margin-top:0">'+triMsg[k]+'</p><p class="small">The whole system falls apart. That\'s why rivals can\'t copy one piece of it. Click the node again to restore it.</p>';
  $('#triHint').textContent='Chain broken: click again to restore';
});

/* exhibit 3 */
const ex3={
  auv:{t:'Average sales per restaurant (FY2025)',max:1385000,rows:[['Little Caesars','lc',950000,'~$950K (est.)'],["Domino's",'dom',1385000,'$1,385K']],n:'<b>About 69% of Domino\'s</b>, and the ratio has held for at least two years. <b>This isn\'t the Walmart pattern.</b> Walmart pairs low cost with <i>high</i> throughput. Little Caesars pairs low cost with <i>low</i> throughput. A low-cost position without volume is fragile, because the chain\'s fixed costs (distribution network, national advertising, brand) are spread over fewer dollars.'},
  fees:{t:'Royalty + advertising fund (% of sales)',max:11,rows:[['Little Caesars','lc',11,'11% (6+5)'],['Pizza Hut','ph',10.75,'10.75%'],["Domino's",'dom',9.5,'9.5%']],n:'<b>The franchisee pays more, not less.</b> A 6% royalty plus a 5% marketing contribution, which the agreement allows to rise to 7%. The common claim that Little Caesars spends less on advertising because "the price does the selling" isn\'t supported by the one comparable, required, disclosed number. It charges franchisees the most of the three.'},
  inv:{t:'Initial investment, low end of range',max:446500,rows:[['Little Caesars','lc',446500,'$446,500'],["Domino's",'dom',107450,'$107,450']],n:'<b>More than 4× Domino\'s</b>, driven largely by a required pre-opening Blue Line equipment and inventory purchase of $250,500–$369,500. In pizza, the low capital-intensity operator is <b>Domino\'s</b>, not Little Caesars. (Little Caesars\' own site advertises a $376,500 floor; the discrepancy is unresolved.)'},
  acsi:{t:'American Customer Satisfaction Index, 2026',max:80,min:74,rows:[['Pizza Hut','ph',80,'80'],['Papa Johns','pj',80,'80'],['Industry avg','avg',79,'79'],["Domino's",'dom',79,'79'],['Little Caesars','lc',78,'78']],n:'<b>Last among the four big pizza chains</b>, the only one below the quick-service average, and the category laggard two years running. In the same period Datassential named it America\'s value leader. <b>It wins on price perception and loses on satisfaction</b>, which is exactly how a low-price, low-volume position looks from outside.'}
};
const ex3Lab={auv:'Sales per store',fees:'Franchise fees',inv:'Buildout cost',acsi:'Satisfaction'};
$('#ex3Tabs').innerHTML=Object.keys(ex3).map((k,i)=>`<button class="btn ${i===0?'on':''}" data-k="${k}">${ex3Lab[k]}</button>`).join('');
function ex3R(k){
  const e=ex3[k]; $('#ex3Title').textContent=e.t;
  $('#ex3Bars').innerHTML=e.rows.map(r=>`<div class="bar"><span>${r[0]}</span><div class="track"><div class="fill ${r[1]}"></div></div><span class="v">${r[3]}</span></div>`).join('');
  requestAnimationFrame(()=>requestAnimationFrame(()=>{
    $$('#ex3Bars .fill').forEach((f,i)=>{const v=e.rows[i][2];f.style.width=(e.min!=null?((v-e.min)/(e.max-e.min))*100:(v/e.max)*100)+'%';});
  }));
  $('#ex3Note').innerHTML=e.n+(e.min!=null?' <span class="small">(Axis starts at 74 so the differences are visible.)</span>':'');
}
$$('#ex3Tabs .btn').forEach(b=>b.onclick=()=>{$$('#ex3Tabs .btn').forEach(x=>x.classList.remove('on'));b.classList.add('on');ex3R(b.dataset.k);});
ex3R('auv');

/* own one link */
const firms=[
  {n:'ASML',a:'Inbound logistics',hit:0,kp:[['€32.7B','2025 sales'],['52.8%','gross margin'],['34.6%','operating margin'],['94%','lithography share (JPMorgan est.)'],['€38.8B','year-end backlog']],
   body:'<p>ASML makes the machines that print circuits below seven nanometers. Its 2025 annual report says it is "currently the world\'s only manufacturer of EUV lithography systems." Not the leader. The only one. Machines are sold out into 2027.</p><p><b>The mechanism:</b> ASML isn\'t mainly a manufacturer. It\'s a <b>systems integrator coordinating 5,100 suppliers</b>, and the hardest physics sits with one of them. In 2016 it paid <b>€1B for 24.9% of Carl Zeiss SMT</b>, the only optics maker capable of EUV mirrors, and committed another €220M in R&amp;D support and €540M in capital and supply-chain funding over six years.</p><div class="callout"><b>Lesson</b>Reaching back into a supplier\'s chain to buy <i>the chokepoint inside the chokepoint</i>. A rival wouldn\'t need to out-engineer ASML. It would need to rebuild a supplier network assembled over three decades.</div>'},
  {n:'TSMC',a:'Operations',hit:1,kp:[['72.5%','global foundry revenue Q2 2026 (record)'],['67.7%','gross margin'],['60.3%','operating margin'],['5.9%','Samsung, the nearest rival']],
   body:'<p>TSMC owns no product designs. It sells fabrication capacity.</p><p><b>The position came from a promise, not a technology:</b> TSMC guarantees it will never compete with its customers. That let Nvidia, Apple, AMD and Qualcomm get rid of their fabs entirely, which pulled all the industry\'s leading-edge demand into one queue. That demand funds the capital spending that keeps TSMC\'s process lead, and the lead attracts more demand. It\'s a self-reinforcing loop.</p><div class="callout"><b>Lesson</b>TSMC gave up the most profitable-looking activity in its industry (designing chips) to own the one activity everyone needed and nobody else wanted to fund.</div>'},
  {n:'YKK',a:'Operations',hit:1,kp:[['~40%','of world zippers'],['10B+','units, year to Mar 2025'],['~1%','of a garment\'s cost'],['n/a','margins (private)']],
   body:'<p>More than 10 billion zippers a year, which the company describes as three million kilometers, about 80 times around the earth. YKK is <b>heavily vertically integrated</b>: it smelts its own brass, makes its own aluminum alloys (Dublin, Georgia), dyes its own tape and builds its own fastening machines.</p><p><b>Two mechanisms:</b></p><ul><li><b>It leases its machines into customers\' factories.</b> With YKK\'s fixed assets on their floor, garment makers face a switching cost for what is otherwise a commodity part.</li><li><b>Its brand rides on the customer\'s product.</b> The zipper is ~1% of the garment\'s cost but often carries the only readable logo, and apparel brands write "YKK" into their specs as a quality signal.</li></ul><div class="callout warn"><b>Caveat</b>YKK is private and publishes no margins, a real limit on this case.</div>'},
  {n:'Amazon',a:'Outbound logistics',hit:2,kp:[['6.7B','US parcels, 2025'],['#1','passed USPS (6.6B)'],['1.5×','UPS volume (4.4B)'],['−10%','FedEx & UPS shares on the news']],
   body:'<p>In 2025 Amazon became the largest US parcel carrier for the first time. In <b>May 2026</b> it started selling the capability: <b>Amazon Supply Chain Services</b> opened its freight, fulfillment and parcel network to any business, launching with Procter &amp; Gamble, 3M, Lands\' End and American Eagle. FedEx and UPS shares each fell about 10%.</p><div class="callout"><b>Lesson: Porter\'s whole argument in one activity</b>An internal cost center, optimized until it became an advantage, then opened up and sold to the incumbents\' own customers.</div>'},
  {n:'Ritz-Carlton',a:'Service',hit:4,kp:[['$2,000','any employee can spend to fix a guest problem'],['>300%','RevPAR above industry avg'],['5.3→9.8%','pre-tax ROI, 1995–98'],['250–310','training hrs, first year']],
   body:'<p>Any employee can spend up to <b>$2,000</b> to resolve a guest problem on the spot. Results (from the 1999 Baldrige Award profile): revenue per available room more than 300% above the industry average, pre-tax ROI nearly doubled, and employee turnover fell for <b>nine straight years</b>.</p><div class="callout"><b>Lesson</b>A support activity (HR: training and discretion) linked directly to a primary one (service) is what makes the service hard to copy.</div>'}
];
const chainNames=['In','Ops','Out','Mkt','Svc'];
$('#linkTabs').innerHTML=firms.map((f,i)=>`<button class="btn ${i===0?'on':''}" data-i="${i}">${f.n} <span class="small">· ${f.a}</span></button>`).join('');
$('#linkPanels').innerHTML=firms.map((f,i)=>`<div class="tabpanel card ${i===0?'on':''}"><div class="row" style="justify-content:space-between"><h3 style="margin:0">${f.n}</h3><span class="pill">${f.a}</span></div><div class="mini-chain">${chainNames.map((c,j)=>`<span class="${j===f.hit?'hit':''}" title="${c}"></span>`).join('')}</div><div class="kpis">${f.kp.map(k=>`<div class="kpi"><div class="k">${k[0]}</div><div class="l">${k[1]}</div></div>`).join('')}</div>${f.body}</div>`).join('');
$$('#linkTabs .btn').forEach(b=>b.onclick=()=>{$$('#linkTabs .btn').forEach(x=>x.classList.remove('on'));b.classList.add('on');$$('#linkPanels .tabpanel').forEach((p,i)=>p.classList.toggle('on',i==b.dataset.i));});

/* coffee */
const coffee=[
  ['Cultivation',21,'#6b8e4e','21% reaches the farmers who grow the coffee.'],
  ['Everything else',12,'#8c877c','Export, import, transport and other steps the reading doesn\'t break out, shown as the remainder. The study finds value concentrates between importer and retailer.'],
  ['Roasting',22,'#8a5a3b','22% to roasting, as people expect.'],
  ['Retail',22,'#2f6f8f','22% to retail, as people expect.'],
  ['German tax',23,'#b8412c','23% is German coffee excise tax. The surprise, and a reason not to generalize: it wouldn\'t appear in a US breakdown.']
];
$('#coffee').innerHTML=coffee.map(c=>`<div style="flex:${c[1]};background:${c[2]}" data-t="${c[3]}">${c[0]}<br>${c[0]==='Everything else'?'rest':c[1]+'%'}</div>`).join('');
$('#coffeeLeg').innerHTML=coffee.map(c=>`<span><i style="background:${c[2]}"></i>${c[0]}</span>`).join('');
const cofDef=$('#coffeeInfo').innerHTML;
$$('#coffee div').forEach(d=>{d.onmouseenter=d.onclick=()=>$('#coffeeInfo').innerHTML='<b>'+d.textContent.replace(/(\d+%|rest)$/,'')+'</b>: '+d.dataset.t;});
$('#coffee').onmouseleave=()=>$('#coffeeInfo').innerHTML=cofDef;

/* profit pool */
const GM=4.9/27.6*100;
const pp=[
  {n:'New vehicles',r:48.9,g:13.4,c:'var(--primary)'},
  {n:'Used vehicles & other',r:28.3,g:9.4,c:'var(--support)',derived:true},
  {n:'Parts & service',r:17.5,g:47.6,c:'var(--accent)'},
  {n:'Finance & insurance',r:5.3,g:29.6,c:'var(--margin)',derived:true}
];
pp.forEach(p=>p.m=p.g/p.r*GM);
let ppMode='pool';
function ppR(){
  const W=760,H=320,L=48,B=40,T=14,R=10, cw=W-L-R, ch=H-B-T;
  let s=`<svg viewBox="0 0 ${W} ${H}" role="img" aria-label="AutoNation profit pool">`;
  if(ppMode==='pool'){
    const maxM=105; let x=L;
    [0,25,50,75,100].forEach(v=>{const y=T+ch-(v/maxM)*ch;s+=`<line x1="${L}" x2="${W-R}" y1="${y}" y2="${y}" stroke="var(--line)"/><text x="${L-6}" y="${y+4}" text-anchor="end" font-size="11" fill="var(--muted)">${v}%</text>`;});
    pp.forEach((p,i)=>{const w=p.r/100*cw,h=p.m/maxM*ch;
      s+=`<rect class="blk" data-i="${i}" x="${x+1}" y="${T+ch-h}" width="${w-2}" height="${h}" fill="${p.c}" rx="2"/>`;
      if(w>60)s+=`<text x="${x+w/2}" y="${T+ch-h-6}" text-anchor="middle" font-size="12" font-weight="700">${p.n}</text>`;
      else s+=`<text x="${x+w/2}" y="${T+ch-h-6}" text-anchor="middle" font-size="11" font-weight="700">F&amp;I</text>`;
      x+=w;});
    s+=`<line class="axis" x1="${L}" x2="${W-R}" y1="${T+ch}" y2="${T+ch}"/><text x="${L+cw/2}" y="${H-8}" text-anchor="middle" font-size="12" fill="var(--muted)">Share of revenue (width) →</text><text transform="translate(12 ${T+ch/2}) rotate(-90)" text-anchor="middle" font-size="12" fill="var(--muted)">Gross margin (height)</text>`;
  } else {
    const bw=cw/pp.length;
    [0,25,50].forEach(v=>{const y=T+ch-(v/50)*ch;s+=`<line x1="${L}" x2="${W-R}" y1="${y}" y2="${y}" stroke="var(--line)"/><text x="${L-6}" y="${y+4}" text-anchor="end" font-size="11" fill="var(--muted)">${v}%</text>`;});
    pp.forEach((p,i)=>{const x0=L+i*bw+bw*.15, w=bw*.3;
      const h1=p.r/50*ch, h2=p.g/50*ch;
      s+=`<rect class="blk" data-i="${i}" x="${x0}" y="${T+ch-h1}" width="${w}" height="${h1}" fill="var(--muted)" opacity=".5"/>`;
      s+=`<rect class="blk" data-i="${i}" x="${x0+w+4}" y="${T+ch-h2}" width="${w}" height="${h2}" fill="${p.c}"/>`;
      s+=`<text x="${x0+w/2}" y="${T+ch-h1-4}" text-anchor="middle" font-size="11">${p.r}%</text><text x="${x0+w*1.5+4}" y="${T+ch-h2-4}" text-anchor="middle" font-size="11" font-weight="700">${p.g}%</text>`;
      s+=`<text x="${L+i*bw+bw/2}" y="${H-20}" text-anchor="middle" font-size="12">${p.n}</text>`;});
    s+=`<text x="${L+cw/2}" y="${H-4}" text-anchor="middle" font-size="11" fill="var(--muted)">grey = share of revenue · colored = share of gross profit</text>`;
  }
  s+='</svg>'; $('#ppChart').innerHTML=s;
  $$('#ppChart .blk').forEach(b=>b.onclick=()=>{const p=pp[b.dataset.i];
    $('#ppInfo').innerHTML=`<b>${p.n}</b>${p.derived?' (derived)':''}: ${p.r}% of revenue, ${p.g}% of gross profit, implied gross margin ≈ ${p.m.toFixed(0)}%. `+(p.r>40?'Wide and flat: a big, poor activity.':p.m>40?'Tall and narrow: a small, rich activity.':'Mid-sized and thin.');});
}
$('#ppRev').onclick=()=>{ppMode='pool';$('#ppRev').classList.add('on');$('#ppShare').classList.remove('on');ppR();};
$('#ppShare').onclick=()=>{ppMode='share';$('#ppShare').classList.add('on');$('#ppRev').classList.remove('on');ppR();};
ppR();

/* quiz */
const Q=[
  {q:'According to Porter\'s argument, what actually has costs?',o:['The firm as a whole','Activities the firm performs','The industry','The buyer'],a:1,e:'"A firm has no costs. Activities the firm does have costs." A firm wins or loses in each activity separately.'},
  {q:'When should you stop disaggregating activities?',o:['When you reach Porter\'s nine categories','When each activity is under 5% of cost','When the parts no longer have different cost drivers, assets, or effects on willingness to pay','Never; finer is always better'],a:2,e:'Split while the parts have different economics; stop when they don\'t. If every activity shares one cost driver, you haven\'t split finely enough.'},
  {q:'What made Amazon\'s 2023 regionalization a linkage story?',o:['Wages fell','A new warehouse technology','No single activity got cheaper; the relationships among them changed','It bought a carrier'],a:2,e:'In-region fulfillment rose from 62% to 76% and cost per unit fell by more than $0.45, but no single box got cheaper.'},
  {q:'Why is deleting an activity the most reliable cost reduction?',o:['It\'s legally simpler','Doing an activity more cheaply than a rival invites the rival to respond','It always raises quality','Franchisees prefer it'],a:1,e:'Removed activities (drivers, order-taking, counters) can\'t be matched by a rival getting more efficient at them.'},
  {q:'Little Caesars\' AUV is about 69% of Domino\'s. Why does the reading call that fragile?',o:['Low volume means fixed chain costs are spread over fewer dollars','It means prices are too high','Low volume always means losses','It breaks the franchise agreement'],a:0,e:'Unlike Walmart (low cost with high throughput), Little Caesars pairs low cost with low throughput.'},
  {q:'Which statement about Little Caesars\' fees is supported by the reading?',o:['It charges the lowest fees because the price does the selling','It charges 11% (6% royalty + 5% marketing), the highest of the three chains','Its fees match Domino\'s','It charges no marketing fee'],a:1,e:'11% vs Domino\'s 9.5% and Pizza Hut\'s 10.75%. The "spends less on ads" claim isn\'t supported.'},
  {q:'Domino\'s and Little Caesars both own their distribution. What\'s the key difference?',o:['Domino\'s doesn\'t own trucks','Domino\'s makes buying optional and shares 50% of supply-chain pre-tax profit; Little Caesars requires its supplier and discloses no profit share','Little Caesars outsources to Sysco','There is no difference'],a:1,e:'Same vertical integration, opposite governance. Domino\'s has to win its franchisees\' business on price every year.'},
  {q:'The reading\'s closing lesson on Little Caesars is to ask two questions. Which pair?',o:['Where did cost go out, and who kept it?','What is the price, and what is the volume?','Who are the rivals, and what do they charge?','Is it cheap, and is it good?'],a:0,e:'Savings were partly captured by the franchisor via Blue Line and fees, rather than going fully to operators or customers.'},
  {q:'What created TSMC\'s position, per the reading?',o:['A patented process','A promise never to compete with its customers','Government subsidies','The lowest prices'],a:1,e:'The promise let chip designers drop their fabs, which pooled demand, which funded capex, which sustains the lead.'},
  {q:'How does YKK turn a commodity part into a switching cost?',o:['Exclusive contracts','Leasing its machines into customers\' factories','Lower prices','Patents'],a:1,e:'YKK\'s fixed assets sit on the customer\'s floor. Its brand also rides free on the customer\'s product.'},
  {q:'Value chain analysis vs. profit pool map:',o:['Both come from your general ledger','Value chain = efficiency tool from your own ledger; profit pool = positioning tool from industry filings','Profit pool is about costs only','They are the same thing'],a:1,e:'One asks how to do an activity better; the other asks whether you\'re standing in the right part of the chain at all.'},
  {q:'In a conventional profit pool chart, what does the area of each block represent?',o:['Revenue','Cost','Profit (revenue share × margin)','Market share'],a:2,e:'x = share of industry revenue, y = operating margin, so area = profit. Tall and narrow = small, rich; wide and flat = large, poor.'},
  {q:'At AutoNation in 2025, F&I plus parts & service were 22.8% of revenue. What share of gross profit?',o:['22.8%','47.6%','77.2%','13.4%'],a:2,e:'The two smallest revenue lines produced 77.2% of gross profit. New vehicles: 48.9% of revenue, 13.4% of GP.'},
  {q:'Delta\'s American Express remuneration ($8.2B) equaled what share of its operating income?',o:['12.9%','50%','100%','141%'],a:3,e:'12.9% of revenue but 141% of operating income ($5.8B).'},
  {q:'Which Gadiesh & Gilbert step "determines the answer" yet has no guiding principle?',o:['Defining the pool\'s boundaries','Estimating overall size','Estimating each activity\'s share','Reconciling'],a:0,e:'Where the chain begins and ends decides what you find, and nobody has offered a principle for drawing the line.'}
];
let qs=0,qa=0;
$('#quiz').innerHTML=Q.map((q,i)=>`<div class="q card" data-i="${i}"><b>${i+1}. ${q.q}</b><div class="opts">${q.o.map((o,j)=>`<button class="opt" data-j="${j}">${o}</button>`).join('')}</div><div class="fb">${q.e}</div></div>`).join('');
$$('#quiz .q').forEach(el=>{const q=Q[el.dataset.i];let done=false;
  el.querySelectorAll('.opt').forEach(b=>b.onclick=()=>{if(done)return;done=true;qa++;
    const j=+b.dataset.j; if(j===q.a)qs++; else b.classList.add('wrong');
    el.querySelectorAll('.opt')[q.a].classList.add('right'); el.querySelector('.fb').classList.add('on');
    $('#score').textContent=qs+' / '+qa+(qa===Q.length?' · done':'');});});
$('#score').textContent='0 / '+0;

/* flashcards */
const F=[
  ['Linkage','When the cost or effectiveness of one activity depends on how another is performed. Hard to copy because you can\'t see which activity subsidizes which.'],
  ['Primary vs support','Primary (5) touch the product on its way to the buyer. Support (4) make primary activities possible and run across all of them.'],
  ['Profit pool','Total profit earned at every point along an industry\'s value chain. Profit concentration ≠ revenue concentration.'],
  ['Own one link','Do one activity so far beyond everyone that the industry must come to you: ASML, TSMC, YKK, Amazon, Ritz-Carlton.'],
  ['Walmart vs Little Caesars','Walmart: low cost + high throughput. Little Caesars: low cost + low throughput, which is fragile.'],
  ['U-Haul','Cheap truck rentals bring in customers; boxes, insurance and storage, bought after they stop shopping around, make the money.']
];
$('#flash').innerHTML=F.map(f=>`<div class="flip"><div class="in"><div class="f"><b>${f[0]}</b><span class="small">tap to flip</span></div><div class="b">${f[1]}</div></div></div>`).join('');
$$('.flip').forEach(f=>f.onclick=()=>f.classList.toggle('on'));

watchBars();
})();
</script>
</body>
</html>


### Response C

<!doctype html>
<html lang="en">
<head>
<meta charset="utf-8">
<meta name="viewport" content="width=device-width, initial-scale=1">
<title>The Value Chain: Study Guide</title>
<style>
  :root {
    --bg: #f7f6f2;
    --panel: #ffffff;
    --ink: #1d1d1b;
    --muted: #5d5d57;
    --line: #dcdad2;
    --accent: #1f6f5c;
    --accent-soft: #d8ece6;
    --warm: #b5562b;
    --warm-soft: #f5e1d6;
    --gold: #b38a1e;
    --gold-soft: #f4ecd0;
    --radius: 12px;
  }
  @media (prefers-color-scheme: dark) {
    :root:not([data-theme="light"]) {
      --bg: #161715;
      --panel: #1f201d;
      --ink: #ecebe6;
      --muted: #a4a39a;
      --line: #3a3b36;
      --accent: #5fc2a6;
      --accent-soft: #1e3b34;
      --warm: #e88a5e;
      --warm-soft: #3b2619;
      --gold: #e0b957;
      --gold-soft: #3a3118;
    }
  }
  :root[data-theme="dark"] {
    --bg: #161715;
    --panel: #1f201d;
    --ink: #ecebe6;
    --muted: #a4a39a;
    --line: #3a3b36;
    --accent: #5fc2a6;
    --accent-soft: #1e3b34;
    --warm: #e88a5e;
    --warm-soft: #3b2619;
    --gold: #e0b957;
    --gold-soft: #3a3118;
  }
  * { box-sizing: border-box; }
  html, body { margin: 0; padding: 0; }
  body {
    background: var(--bg);
    color: var(--ink);
    font-family: -apple-system, BlinkMacSystemFont, "Segoe UI", Helvetica, Arial, sans-serif;
    line-height: 1.55;
    font-size: 16px;
  }
  header.top {
    padding: 28px 16px 12px;
    max-width: 980px;
    margin: 0 auto;
  }
  h1 { font-size: 1.9rem; margin: 0 0 6px; letter-spacing: -0.01em; }
  h2 { font-size: 1.4rem; margin: 0 0 8px; }
  h3 { font-size: 1.05rem; margin: 0 0 6px; }
  p { margin: 0 0 10px; }
  .sub { color: var(--muted); margin: 0; }
  nav.tabs {
    position: sticky; top: 0; z-index: 5;
    background: var(--bg);
    border-bottom: 1px solid var(--line);
    overflow-x: auto;
    white-space: nowrap;
  }
  nav.tabs .inner {
    max-width: 980px; margin: 0 auto; padding: 0 16px;
    display: flex; gap: 4px;
  }
  nav.tabs button {
    background: none; border: 0; border-bottom: 3px solid transparent;
    color: var(--muted); padding: 12px 10px; cursor: pointer;
    font: inherit; font-size: 0.92rem;
  }
  nav.tabs button.on { color: var(--ink); border-bottom-color: var(--accent); font-weight: 600; }
  main { max-width: 980px; margin: 0 auto; padding: 8px 16px 60px; }
  section.tab { display: none; }
  section.tab.on { display: block; }
  .card {
    background: var(--panel);
    border: 1px solid var(--line);
    border-radius: var(--radius);
    padding: 18px;
    margin: 14px 0;
  }
  .grid2 { display: grid; grid-template-columns: 1fr; gap: 14px; }
  @media (min-width: 720px) { .grid2 { grid-template-columns: 1fr 1fr; } }
  .note { color: var(--muted); font-size: 0.88rem; }
  .callout {
    border-left: 4px solid var(--accent);
    background: var(--accent-soft);
    padding: 12px 14px;
    border-radius: 8px;
    margin: 14px 0;
  }
  .callout.warm { border-left-color: var(--warm); background: var(--warm-soft); }
  .callout.gold { border-left-color: var(--gold); background: var(--gold-soft); }
  .stat { font-size: 1.7rem; font-weight: 700; color: var(--accent); line-height: 1.1; }
  .stat-label { color: var(--muted); font-size: 0.86rem; }
  .kpis { display: grid; grid-template-columns: repeat(2, 1fr); gap: 10px; }
  @media (min-width: 720px) { .kpis { grid-template-columns: repeat(4, 1fr); } }
  .kpi { background: var(--panel); border: 1px solid var(--line); border-radius: 10px; padding: 12px; }
  button.btn {
    background: var(--accent); color: #fff; border: 0; border-radius: 8px;
    padding: 9px 14px; font: inherit; font-weight: 600; cursor: pointer;
  }
  button.btn.ghost { background: transparent; color: var(--accent); border: 1px solid var(--accent); }
  button.btn:focus-visible, nav.tabs button:focus-visible, .chip:focus-visible, .step:focus-visible {
    outline: 3px solid var(--gold); outline-offset: 2px;
  }

  /* ---------- Section 1: chain diagram ---------- */
  .chain {
    display: grid; grid-template-columns: repeat(5, 1fr); gap: 6px; margin-top: 10px;
  }
  .chain .prim { grid-column: span 1; }
  .box {
    background: var(--accent-soft); border: 1px solid var(--accent);
    border-radius: 8px; padding: 10px 6px; text-align: center; cursor: pointer;
    font-size: 0.8rem; font-weight: 600; min-height: 74px;
    display: flex; align-items: center; justify-content: center; color: var(--ink);
    transition: transform .12s ease, box-shadow .12s ease;
  }
  .box:hover { transform: translateY(-2px); box-shadow: 0 4px 10px rgba(0,0,0,.08); }
  .box.sup { background: var(--gold-soft); border-color: var(--gold); }
  .box.on { outline: 3px solid var(--warm); }
  .support-row { display: grid; grid-template-columns: repeat(4, 1fr); gap: 6px; margin-top: 6px; }
  .support-row .box { min-height: 60px; }
  .margin-box {
    margin-top: 6px; background: var(--warm-soft); border: 1px dashed var(--warm);
    border-radius: 8px; padding: 10px; text-align: center; font-size: 0.85rem;
  }
  .detail { min-height: 130px; }
  .detail h3 { color: var(--accent); }

  /* ---------- Section 2: steps ---------- */
  .step {
    display: block; width: 100%; text-align: left; background: var(--panel);
    border: 1px solid var(--line); border-radius: var(--radius); padding: 14px 16px;
    margin: 8px 0; cursor: pointer; font: inherit; color: var(--ink);
  }
  .step .num {
    display: inline-block; width: 26px; height: 26px; border-radius: 50%;
    background: var(--accent); color: #fff; text-align: center; line-height: 26px;
    font-weight: 700; margin-right: 8px; font-size: 0.85rem;
  }
  .step .body { display: none; margin-top: 10px; color: var(--ink); }
  .step.open .body { display: block; }
  .step .hint { color: var(--muted); font-size: 0.88rem; }
  ul.q { margin: 6px 0 0 18px; padding: 0; }
  ul.q li { margin: 4px 0; }

  /* ---------- Section 3: Little Caesars ---------- */
  .bar-row { display: grid; grid-template-columns: 110px 1fr 90px; gap: 8px; align-items: center; margin: 8px 0; font-size: 0.92rem; }
  .bar { height: 22px; background: var(--line); border-radius: 6px; overflow: hidden; }
  .bar > span { display: block; height: 100%; background: var(--accent); }
  .bar > span.warm { background: var(--warm); }
  .bar > span.gold { background: var(--gold); }
  .bar-val { text-align: right; font-variant-numeric: tabular-nums; }
  .chips { display: flex; flex-wrap: wrap; gap: 8px; margin: 8px 0 12px; }
  .chip {
    background: var(--panel); border: 1px solid var(--line); border-radius: 999px;
    padding: 6px 12px; cursor: pointer; font: inherit; font-size: 0.88rem; color: var(--ink);
  }
  .chip.on { background: var(--accent); border-color: var(--accent); color: #fff; }
  .link-chain { display: flex; flex-wrap: wrap; gap: 6px; align-items: center; margin: 10px 0; }
  .link-chain .node {
    background: var(--panel); border: 1px solid var(--line); border-radius: 8px;
    padding: 8px 10px; font-size: 0.88rem; cursor: pointer; font: inherit; color: var(--ink);
  }
  .link-chain .node.on { background: var(--warm-soft); border-color: var(--warm); }
  .link-chain .arrow { color: var(--muted); }
  table.plain { width: 100%; border-collapse: collapse; font-size: 0.9rem; }
  table.plain th, table.plain td { text-align: left; padding: 8px 6px; border-bottom: 1px solid var(--line); vertical-align: top; }
  table.plain th { color: var(--muted); font-weight: 600; font-size: 0.82rem; text-transform: uppercase; letter-spacing: .03em; }
  .scroll { overflow-x: auto; }

  /* ---------- Section 4: single-activity ---------- */
  .firm { border-top: 4px solid var(--accent); }
  .firm.warm { border-top-color: var(--warm); }
  .firm.gold { border-top-color: var(--gold); }
  .firm h3 { font-size: 1.1rem; }
  .tag { display: inline-block; font-size: 0.75rem; text-transform: uppercase; letter-spacing: .05em; color: var(--muted); }

  /* ---------- Section 5: profit pools ---------- */
  .pool-toggle { display: flex; gap: 8px; margin-bottom: 10px; flex-wrap: wrap; }
  .pool-bars .row { display: grid; grid-template-columns: 170px 1fr 60px; gap: 8px; align-items: center; margin: 8px 0; font-size: 0.9rem; }
  .pool-bars .track { height: 26px; background: var(--line); border-radius: 6px; overflow: hidden; }
  .pool-bars .track > span { display: block; height: 100%; background: var(--accent); transition: width .35s ease; }
  .pool-bars .track > span.alt { background: var(--warm); }
  .block-map { position: relative; height: 240px; border: 1px solid var(--line); border-radius: 8px; background: var(--panel); margin-top: 10px; }
  .block-map .blk {
    position: absolute; background: var(--accent-soft); border: 1px solid var(--accent);
    font-size: 0.78rem; padding: 4px; overflow: hidden; color: var(--ink);
  }
  .axis-note { font-size: 0.82rem; color: var(--muted); margin-top: 6px; }

  /* ---------- Section 6: quiz + cheat sheet ---------- */
  .q-item { border-bottom: 1px solid var(--line); padding: 12px 0; }
  .q-item:last-child { border-bottom: 0; }
  .q-item .ans { display: none; margin-top: 8px; padding: 10px 12px; background: var(--accent-soft); border-radius: 8px; }
  .q-item.revealed .ans { display: block; }
  .cheat { background: var(--panel); border: 2px solid var(--accent); border-radius: 14px; padding: 18px; }
  .cheat ol { margin: 6px 0 0 20px; padding: 0; }
  .cheat li { margin: 6px 0; }
  .score { font-weight: 700; color: var(--accent); }
  .draw input[type="text"] {
    width: 100%; padding: 9px 10px; border-radius: 8px; border: 1px solid var(--line);
    background: var(--bg); color: var(--ink); font: inherit; margin-bottom: 8px;
  }
  .draw ol { padding-left: 22px; margin: 8px 0 0; }
  .draw li { margin: 6px 0; }
  .draw .x { cursor: pointer; background: none; border: 0; color: var(--warm); font-size: 1rem; margin-left: 6px; }
  footer.src { max-width: 980px; margin: 0 auto; padding: 0 16px 40px; color: var(--muted); font-size: 0.82rem; }
  footer.src ul { padding-left: 18px; }
</style>
</head>
<body>

<header class="top">
  <h1>The Value Chain</h1>
  <p class="sub">A study guide to the reading: what the framework is, how to run it, and what it reveals about profit. Click anything that looks interactive.</p>
</header>

<nav class="tabs" aria-label="Sections">
  <div class="inner">
    <button class="on" data-tab="t1">1. The chain</button>
    <button data-tab="t2">2. Run one</button>
    <button data-tab="t3">3. Little Caesars</button>
    <button data-tab="t4">4. Own one link</button>
    <button data-tab="t5">5. Profit pools</button>
    <button data-tab="t6">6. Quiz and cheat sheet</button>
  </div>
</nav>

<main>

<!-- ============ TAB 1 ============ -->
<section class="tab on" id="t1">
  <h2>Porter's value chain</h2>
  <p>Michael Porter's 1985 idea breaks a firm into the activities it performs. Competitive advantage lives in those activities, not in the firm as a whole, because a firm has no costs. Activities do. Porter sorted them into nine generic boxes.</p>

  <div class="card">
    <h3>The chain (tap a box)</h3>
    <div class="note">Blue-green boxes are primary activities that touch the product on its way to the buyer. Gold boxes are support activities that run across all of them.</div>
    <div class="chain" id="primRow">
      <div class="box" data-key="inb" tabindex="0">Inbound logistics</div>
      <div class="box" data-key="ops" tabindex="0">Operations</div>
      <div class="box" data-key="outb" tabindex="0">Outbound logistics</div>
      <div class="box" data-key="mkt" tabindex="0">Marketing and sales</div>
      <div class="box" data-key="svc" tabindex="0">Service</div>
    </div>
    <div class="support-row" id="supRow">
      <div class="box sup" data-key="inf" tabindex="0">Firm infrastructure</div>
      <div class="box sup" data-key="hr" tabindex="0">Human resources</div>
      <div class="box sup" data-key="tech" tabindex="0">Technology development</div>
      <div class="box sup" data-key="proc" tabindex="0">Procurement</div>
    </div>
    <div class="margin-box" data-key="margin" tabindex="0" role="button" style="cursor:pointer">Profit margin: what is left when the buyer's willingness to pay exceeds the total cost of everything to the left</div>
    <div class="detail card" id="detail" aria-live="polite" style="margin-bottom:0"></div>
  </div>

  <div class="grid2">
    <div class="card">
      <h3>Two things people miss</h3>
      <p><strong>1. The boxes are a starting point.</strong> Split an activity when its parts have different economics. "Operations" at an airline is not one activity: gate turnaround and engine overhaul share almost nothing.</p>
      <p><strong>2. The advantage often sits between the boxes.</strong> Porter calls these <em>linkages</em>: the cost of one activity depends on how another is done. More inbound inspection means less rework. More inventory means less expediting.</p>
    </div>
    <div class="card">
      <h3>Why linkages make chains hard to copy</h3>
      <p>A rival can see any single activity: store layouts, shelf prices, job postings, patents. What it cannot easily see is which activity is subsidizing which.</p>
      <div class="callout">Amazon's 2023 network redesign is the reading's example. No single activity got cheaper. The relationships among them changed, and cost per unit fell for the first time since 2018.</div>
    </div>
  </div>
</section>

<!-- ============ TAB 2 ============ -->
<section class="tab" id="t2">
  <h2>How to run a value chain analysis</h2>
  <p>The framework only describes. The analysis is five steps. Each step has a predictable way to fail when you skip its questions. Open each one.</p>

  <button class="step open" data-step>
    <span class="num">1</span><strong>Disaggregate until the activities have different economics</strong>
    <div class="body">
      <p>Keep splitting while the parts differ in cost driver, assets, or effect on what a buyer will pay. Stop when they do not.</p>
      <ul class="q">
        <li>Which activities here have genuinely different cost behavior?</li>
        <li>Which are a large or growing share of cost?</li>
        <li>Which does the buyer actually perceive?</li>
      </ul>
      <p class="hint">Failure mode: if every activity has the same cost driver, you have not cut finely enough.</p>
    </div>
  </button>

  <button class="step" data-step>
    <span class="num">2</span><strong>Put a cost and an asset against every box</strong>
    <div class="body">
      <p>Most firms can do this for the plant. Almost none can do it for procurement or technology development, which is why those are where the surprises are. An activity that is cheap to run but ties up working capital is not cheap.</p>
      <ul class="q">
        <li>Assign operating cost and the assets employed.</li>
        <li>If we had to sell this activity as a standalone business tomorrow, what would its income statement look like?</li>
      </ul>
    </div>
  </button>

  <button class="step" data-step>
    <span class="num">3</span><strong>Ask what drives cost in each box</strong>
    <div class="body">
      <p>Porter names ten drivers. Go through them one at a time instead of assuming scale is the answer:</p>
      <div class="chips" style="margin-top:8px">
        <span class="chip" style="cursor:default">Scale</span>
        <span class="chip" style="cursor:default">Learning</span>
        <span class="chip" style="cursor:default">Capacity utilization</span>
        <span class="chip" style="cursor:default">Linkages</span>
        <span class="chip" style="cursor:default">Interrelationships across units</span>
        <span class="chip" style="cursor:default">Vertical integration</span>
        <span class="chip" style="cursor:default">Timing of entry</span>
        <span class="chip" style="cursor:default">Discretionary policy</span>
        <span class="chip" style="cursor:default">Location</span>
        <span class="chip" style="cursor:default">Institutional factors</span>
      </div>
      <p class="hint">Test: is our cost driven by how much we do, how long we have done it, or a policy someone set in 1998?</p>
    </div>
  </button>

  <button class="step" data-step>
    <span class="num">4</span><strong>Work the linkages, not the boxes</strong>
    <div class="body">
      <p>Look for pairs where spending more in one place saves more in another. Also look for the reverse: a local optimization that pushes cost downstream. Extend this outside the firm to suppliers' and channels' chains.</p>
      <ul class="q">
        <li>Whose budget absorbs the cost of our choice, and does that person know?</li>
      </ul>
    </div>
  </button>

  <button class="step" data-step>
    <span class="num">5</span><strong>Decide what to own, buy, or let someone else's brand ride on</strong>
    <div class="body">
      <p>The chain is a map of make-or-buy decisions that were mostly made by accident. Revisit them on purpose.</p>
      <ul class="q">
        <li>Which of these activities would we defend to the last dollar?</li>
        <li>Which are we performing only because we always have?</li>
      </ul>
    </div>
  </button>
</section>

<!-- ============ TAB 3 ============ -->
<section class="tab" id="t3">
  <h2>Little Caesars: a cost position built activity by activity</h2>
  <p>Its advantage is not in one place. It is spread across small, deliberate, mutually reinforcing decisions. Tap a row to see why it costs less.</p>

  <div class="card scroll">
    <table class="plain" id="lcTable">
      <thead><tr><th>Activity</th><th>What it does</th></tr></thead>
      <tbody>
        <tr data-row="0" style="cursor:pointer"><td><strong>Inbound logistics and procurement</strong></td><td>A captive distributor (Blue Line, Ilitch-owned) supplies nearly all food, packaging and equipment. Pepsi is the exclusive beverage supplier.</td></tr>
        <tr data-row="1" style="cursor:pointer"><td><strong>Operations</strong></td><td>Pizza is made to a forecast and held in a warming rack, not to order. Narrow menu. Stores are about 1,200 to 1,600 sq ft, with a newer modular format just over 1,000.</td></tr>
        <tr data-row="2" style="cursor:pointer"><td><strong>Outbound logistics</strong></td><td>Carryout only from 1959 to 2019. Delivery via DoorDash Drive, not an owned fleet. The Pizza Portal (a heated self-service locker, rolled out nationally in 2018) bypasses the counter.</td></tr>
        <tr data-row="3" style="cursor:pointer"><td><strong>Marketing and sales</strong></td><td>For eighteen years the proposition was one number: $5, Hot-N-Ready, no coupon, no wait, no decision.</td></tr>
      </tbody>
    </table>
    <div class="callout" id="lcWhy" style="margin-top:12px">Tap a row above.</div>
  </div>

  <div class="card">
    <h3>The linkage triad: pull out any one and the other two stop making sense</h3>
    <div class="note">Tap a node to light up what depends on it.</div>
    <div class="link-chain" id="triad">
      <button class="node" data-node="0">Narrow menu (4 products)</button>
      <span class="arrow">makes a forecast tractable</span>
      <button class="node" data-node="1">Made-ahead production</button>
      <span class="arrow">delivers high throughput per labor hour</span>
      <button class="node" data-node="2">Low price</button>
      <span class="arrow">works only when variety is not the buyer's demand</span>
    </div>
    <div class="callout" id="triadNote">Select a node.</div>
  </div>

  <div class="grid2">
    <div class="card">
      <h3>Sales per restaurant (estimated for LC)</h3>
      <div class="bar-row"><span>Domino's</span><div class="bar"><span style="width:100%"></span></div><span class="bar-val">$1,385,000</span></div>
      <div class="bar-row"><span>Little Caesars</span><div class="bar"><span class="warm" style="width:68.6%"></span></div><span class="bar-val">~$950,000</span></div>
      <p class="note">About 69 percent of Domino's volume. Low cost paired with low throughput. The fixed costs of the chain are spread over fewer dollars.</p>
    </div>
    <div class="card">
      <h3>Franchisee fees (percent of sales)</h3>
      <div class="bar-row"><span>Little Caesars</span><div class="bar" style="display:flex"><span style="width:55%"></span><span class="warm" style="width:45%"></span></div><span class="bar-val">11%</span></div>
      <div class="bar-row"><span>Pizza Hut</span><div class="bar"><span class="gold" style="width:96%"></span></div><span class="bar-val">10.75%</span></div>
      <div class="bar-row"><span>Domino's</span><div class="bar"><span class="gold" style="width:86%"></span></div><span class="bar-val">9.5%</span></div>
      <p class="note">Little Caesars: 6% royalty (green) plus a 5% marketing contribution (orange), which the agreement allows up to 7%. The franchisee pays the most of the three.</p>
    </div>
    <div class="card">
      <h3>Initial investment floor</h3>
      <div class="bar-row"><span>Little Caesars</span><div class="bar"><span class="warm" style="width:100%"></span></div><span class="bar-val">~$446,500</span></div>
      <div class="bar-row"><span>Domino's</span><div class="bar"><span style="width:24.1%"></span></div><span class="bar-val">$107,450</span></div>
      <p class="note">Driven by a mandatory Blue Line equipment and inventory purchase of $250,500 to $369,500. Caveat: Little Caesars' own site lists a $376,500 floor. The discrepancy is unresolved in the reading.</p>
    </div>
    <div class="card">
      <h3>Price has moved</h3>
      <div class="bar-row"><span>2004 to Jan 2022</span><div class="bar"><span style="width:73%"></span></div><span class="bar-val">$5.00</span></div>
      <div class="bar-row"><span>Jan 2022</span><div class="bar"><span style="width:82%"></span></div><span class="bar-val">$5.55</span></div>
      <div class="bar-row"><span>Current (third-party est.)</span><div class="bar"><span class="warm" style="width:100%"></span></div><span class="bar-val">~$6.79</span></div>
      <p class="note">Domino's runs a national "Best Deal Ever" at $9.99. In July 2025 Little Caesars launched its first value menu at $9.99, online only.</p>
    </div>
  </div>

  <div class="card">
    <h3>Satisfaction points the same way</h3>
    <div class="kpis">
      <div class="kpi"><div class="stat">78</div><div class="stat-label">Little Caesars, ACSI 2026</div></div>
      <div class="kpi"><div class="stat">79</div><div class="stat-label">Quick-service industry average</div></div>
      <div class="kpi"><div class="stat">79</div><div class="stat-label">Domino's</div></div>
      <div class="kpi"><div class="stat">80</div><div class="stat-label">Pizza Hut and Papa Johns</div></div>
    </div>
    <p class="note" style="margin-top:10px">Little Caesars is the only one of the four big pizza chains below the industry average. Datassential calls it the value leader. It wins on price perception and loses on satisfaction, which is what a low-price, low-volume position looks like from outside.</p>
  </div>

  <div class="callout gold">
    <strong>The key distinction.</strong> A value chain analysis tells you where the cost went out. It does not tell you who kept it. In this case, the savings were partly captured by the franchisor through a mandatory supply relationship and the highest fee load in the category.
  </div>
</section>

<!-- ============ TAB 4 ============ -->
<section class="tab" id="t4">
  <h2>Own one link</h2>
  <p>The opposite of Little Caesars is to take one activity and perform it so far beyond anyone else that the rest of the industry comes to you. Five examples, one per activity.</p>

  <div class="grid2">
    <div class="card firm">
      <span class="tag">Inbound logistics</span>
      <h3>ASML: lithography</h3>
      <p>The only maker of EUV lithography systems, with an estimated 94 percent share of all lithography (JPMorgan estimate). 2025 sales of €32.7 billion, 52.8 percent gross margin, 34.6 percent operating margin, €38.8 billion backlog.</p>
      <p><strong>The mechanism:</strong> ASML is a systems integrator coordinating about 5,100 suppliers. In 2016 it bought 24.9 percent of Carl Zeiss SMT, the only optics house that can make EUV mirrors. A rival would have to rebuild a supplier network built over three decades.</p>
    </div>

    <div class="card firm warm">
      <span class="tag">Operations</span>
      <h3>TSMC: fabrication capacity</h3>
      <p>Owns no product designs. Took 72.5 percent of global foundry revenue in Q2 2026 (a record), with a 67.7 percent gross margin and 60.3 percent operating margin. Samsung had 5.9 percent.</p>
      <p><strong>The mechanism:</strong> A promise, not a technology. TSMC never competes with its customers. That let Nvidia, Apple, AMD and Qualcomm shed their fabs, which concentrated demand, which funds the node lead.</p>
    </div>

    <div class="card firm gold">
      <span class="tag">Operations (supplier)</span>
      <h3>YKK: zippers</h3>
      <p>About 40 percent of the world's zippers, more than 10 billion units in the year to March 2025. It smelts its own brass, makes its own alloys, dyes its tape, and builds its own fastening machinery.</p>
      <p><strong>The mechanism:</strong> It leases machines into customers' factories, so its fixed assets sit on the garment maker's floor. The zipper is about 1 percent of a garment's cost, yet its logo is often the only one on the product.</p>
      <p class="note">Caveat: YKK is private and publishes no margins. The reading says so out loud.</p>
    </div>

    <div class="card firm">
      <span class="tag">Outbound logistics</span>
      <h3>Amazon: parcels</h3>
      <p>In calendar 2025 it delivered 6.7 billion US parcels, passing USPS and becoming the largest carrier. In May 2026 it began selling the capability through Amazon Supply Chain Services.</p>
      <p><strong>The mechanism:</strong> An internal cost center, optimized until it became an advantage, then sold to the incumbents' own customers. FedEx and UPS shares each fell about 10 percent on the news.</p>
    </div>

    <div class="card firm">
      <span class="tag">Service</span>
      <h3>The Ritz-Carlton</h3>
      <p>Any employee may spend up to $2,000 on the spot to fix a guest problem. Revenue per available room beat the industry by more than 300 percent. Pre-tax ROI nearly doubled from 5.3 to 9.8 percent (1995 to 1998). First-year staff trained 250 to 310 hours. Turnover fell nine straight years.</p>
      <p class="note">Source is a 1999 Baldrige profile. Treat the figures as historical, not current.</p>
    </div>
  </div>
</section>

<!-- ============ TAB 5 ============ -->
<section class="tab" id="t5">
  <h2>Profit pools: where the money sits</h2>
  <p>If activities have different economics, the money piles up in some parts of any chain. A <em>value chain</em> map comes from your own ledger and shows where costs are. A <em>profit pool</em> map comes from industry filings and shows where everyone's profits are. The first is an efficiency tool. The second asks whether you stand in the right part of the chain at all.</p>

  <div class="card">
    <h3>A car dealership, from public filings (AutoNation, 2025)</h3>
    <div class="pool-toggle">
      <button class="btn" id="poolRev">Share of revenue</button>
      <button class="btn ghost" id="poolGP">Share of gross profit</button>
    </div>
    <div class="pool-bars" id="poolBars"></div>
    <p class="note">Total: $27.6 billion of sales and $4.9 billion of gross profit. Finance and insurance is derived here: it is the combined 22.8 percent (revenue) and 77.2 percent (gross profit) minus parts and service. Calculated from the disclosed dollar figures.</p>
    <div class="callout">Parts, service, finance and insurance are 22.8 percent of sales and 77.2 percent of gross profit. New vehicles are 48.9 percent of revenue and only 13.4 percent of gross profit.</div>
  </div>

  <div class="card">
    <h3>Map the pool (the Gadiesh and Gilbert method)</h3>
    <div class="note">Click each step to see what it demands.</div>
    <button class="step open" data-step>
      <span class="num">1</span><strong>Define the pool's boundaries</strong>
      <div class="body">Decide where the chain starts and ends, and which activities belong. This choice determines the answer. The original articles give no principle for drawing the line.</div>
    </button>
    <button class="step" data-step>
      <span class="num">2</span><strong>Estimate the total pool size</strong>
      <div class="body">Total profit (not revenue) across every activity inside the boundary.</div>
    </button>
    <button class="step" data-step>
      <span class="num">3</span><strong>Estimate each activity's share</strong>
      <div class="body">The hard step. Activity-level margins are rarely disclosed, so they are reconstructed from pure-play comparables and triangulation.</div>
    </button>
    <button class="step" data-step>
      <span class="num">4</span><strong>Check and reconcile</strong>
      <div class="body">A method that spends a quarter of itself on reconciliation is one whose authors knew the numbers would not tie out.</div>
    </button>

    <h3 style="margin-top:14px">How to draw it</h3>
    <p class="note">Horizontal axis: share of industry revenue. Vertical axis: operating margin. The area of each block is its profit. A tall narrow block is a small, rich activity. A wide flat one is large and poor.</p>
    <div class="block-map" id="blockMap" aria-label="Illustrative profit pool map"></div>
    <div class="axis-note">Illustrative only. Block shapes are generic, not measured data.</div>
  </div>

  <div class="grid2">
    <div class="card">
      <h3>An airline that is a credit card</h3>
      <p>Delta, 2025: $63.4 billion revenue, $5.8 billion operating income.</p>
      <p>Its American Express remuneration was $8.2 billion, up 11 percent.</p>
      <div class="kpis">
        <div class="kpi"><div class="stat">12.9%</div><div class="stat-label">of revenue</div></div>
        <div class="kpi"><div class="stat">141%</div><div class="stat-label">of operating income</div></div>
      </div>
    </div>
    <div class="card">
      <h3>A phone business that is one firm</h3>
      <p>Apple shipped about a fifth of the world's smartphones in 2025, and took 49 percent of industry revenue in Q2 2026.</p>
      <p class="note">Its last published share of industry operating profit is 85 percent, from 2023. It has not been updated since.</p>
    </div>
    <div class="card">
      <h3>A hotel industry that is a website</h3>
      <p>Booking Holdings, 2025: $186.1 billion intermediated, $26.9 billion kept as revenue, $8.825 billion operating income. It owns, builds, staffs and cleans no rooms.</p>
      <p>Marriott, the largest hotel company, earned $4.141 billion. The intermediary out-earned the largest brand owner by more than two to one.</p>
    </div>
    <div class="card">
      <h3>Coffee: where the retail price goes</h3>
      <p class="note">German market, 2021, modeled from BASIC (2024), not audited.</p>
      <div class="bar-row"><span>Cultivation</span><div class="bar"><span style="width:21%"></span></div><span class="bar-val">21%</span></div>
      <div class="bar-row"><span>Roasting</span><div class="bar"><span class="gold" style="width:22%"></span></div><span class="bar-val">22%</span></div>
      <div class="bar-row"><span>Retail</span><div class="bar"><span class="gold" style="width:22%"></span></div><span class="bar-val">22%</span></div>
      <div class="bar-row"><span>Excise tax</span><div class="bar"><span class="warm" style="width:23%"></span></div><span class="bar-val">23%</span></div>
      <p class="note">Excise is German-specific and would not appear in a US breakdown. The study's point: farm prices are disconnected from consumer prices.</p>
    </div>
  </div>

  <div class="callout warm">
    <strong>Two caveats from the reading.</strong> The iPhone margin often cited (Apple at 58 percent of an iPhone 4's price) uses 2010 data and is not a full retail decomposition. The U-Haul profit example comes from Bain's republication, and the car dealership example attributed to Gadiesh and Gilbert could not be verified.
  </div>
</section>

<!-- ============ TAB 6 ============ -->
<section class="tab" id="t6">
  <h2>Check yourself</h2>
  <p>Tap a question to reveal the answer. Then read the cheat sheet.</p>

  <div class="card">
    <div class="q-item"><strong>1. What does Porter say a firm actually has?</strong>
      <button class="btn ghost" data-reveal style="margin-left:8px;padding:4px 10px">Show answer</button>
      <div class="ans">No costs. Activities have costs. A firm wins or loses in each activity separately.</div></div>
    <div class="q-item"><strong>2. Name the two kinds of linkage the reading uses as an example.</strong>
      <button class="btn ghost" data-reveal style="margin-left:8px;padding:4px 10px">Show answer</button>
      <div class="ans">Inbound inspection reduces rework. Holding inventory reduces expediting. Also: designing a part to snap instead of bolt shortens assembly.</div></div>
    <div class="q-item"><strong>3. Why does Little Caesars' low price only work with high throughput per labor hour?</strong>
      <button class="btn ghost" data-reveal style="margin-left:8px;padding:4px 10px">Show answer</button>
      <div class="ans">Made-ahead production delivers the throughput. Without it, a low price cannot cover labor. Remove any one of narrow menu, made-ahead production, or low price and the other two stop making sense.</div></div>
    <div class="q-item"><strong>4. Why is Little Caesars' volume a fragility rather than a strength?</strong>
      <button class="btn ghost" data-reveal style="margin-left:8px;padding:4px 10px">Show answer</button>
      <div class="ans">It pairs low cost with low throughput, unlike Walmart. Fixed chain costs (distribution, national advertising, brand) are spread over fewer dollars.</div></div>
    <div class="q-item"><strong>5. What is a profit pool, and how does it differ from a value chain map?</strong>
      <button class="btn ghost" data-reveal style="margin-left:8px;padding:4px 10px">Show answer</button>
      <div class="ans">A profit pool is the total profit earned at every point along an industry's chain. The value chain map uses your own ledger to show costs. The profit pool uses industry filings to show where everyone's profits sit. The first is an efficiency instrument; the second is a positioning instrument.</div></div>
    <div class="q-item"><strong>6. Why does the reading say the pattern of profit differs from revenue?</strong>
      <button class="btn ghost" data-reveal style="margin-left:8px;padding:4px 10px">Show answer</button>
      <div class="ans">Profit concentrates in different places than revenue. In a car dealership, parts, service, finance and insurance are 22.8 percent of sales but 77.2 percent of gross profit.</div></div>
    <div class="q-item"><strong>7. What did Amazon's 2023 network redesign change, and what did it not change?</strong>
      <button class="btn ghost" data-reveal style="margin-left:8px;padding:4px 10px">Show answer</button>
      <div class="ans">It regionalized the US into eight largely self-sufficient regions. No single activity got cheaper. The relationships among them changed, and cost per unit fell.</div></div>
    <div class="q-item"><strong>8. What is the "key distinction" the reading ends on?</strong>
      <button class="btn ghost" data-reveal style="margin-left:8px;padding:4px 10px">Show answer</button>
      <div class="ans">A value chain analysis shows where the cost went out. It does not show who kept it. Ask both questions.</div></div>
    <p class="score" id="score" style="margin-top:12px"></p>
  </div>

  <div class="card draw">
    <h3>Draw your own chain</h3>
    <p class="note">Type in your activities (one per box). Split the ones with different economics. Then ask the question the reading ends on.</p>
    <input type="text" id="actIn" placeholder="e.g. Customer onboarding" aria-label="Activity name">
    <button class="btn" id="addAct">Add activity</button>
    <ol id="actList"></ol>
    <div class="callout gold" id="finalQ" style="display:none">
      If you could defend only one of these to the last dollar, which would it be, and is it the one you are funding?
    </div>
  </div>

  <div class="cheat" aria-label="One-card cheat sheet">
    <h3 style="color:var(--accent)">One-card cheat sheet</h3>
    <ol>
      <li><strong>Value chain</strong>: a firm is a set of activities, each with a cost. Advantage lives in the activities and the links between them.</li>
      <li><strong>Run it in five steps</strong>: split by economics, attach cost and assets, find cost drivers (ten of them), work the linkages, decide make vs. buy.</li>
      <li><strong>Linkages</strong>: the hard-to-copy part. Competitors can see activities but not which ones subsidize which.</li>
      <li><strong>Delete an activity</strong> is the most reliable cost cut, because matching a rival's performance invites a response.</li>
      <li><strong>Own one link</strong>: be so good at one activity that the industry comes to you (ASML, TSMC, YKK, Amazon).</li>
      <li><strong>Profit pool</strong>: map where industry profit sits, using filings. Revenue and profit concentrate in different places.</li>
      <li><strong>Two questions</strong>: where did the cost go out, and who kept it?</li>
    </ol>
  </div>
</section>

</main>

<footer class="src">
  <p><strong>Source notes.</strong> This guide summarizes one reading. Figures are as the reading reports them, mid-September 2026. Where the reading marks a figure as an estimate (Little Caesars volume, the lithography share, the current price, the coffee breakdown), this guide keeps that label.</p>
  <ul>
    <li>Porter, <em>Competitive Advantage</em> (1985), Ch. 2 and 3.</li>
    <li>Gadiesh and Gilbert, "Profit Pools" and "How to Map Your Industry's Profit Pool," HBR 1998.</li>
    <li>AutoNation FY2025 results; Delta FY2025; Booking Holdings FY2025; ASML FY2025; TSMC Q2 2026 (via TrendForce).</li>
  </ul>
</footer>

<script>
(function () {
  "use strict";

  function $(sel, root) { return (root || document).querySelector(sel); }
  function $all(sel, root) { return Array.prototype.slice.call((root || document).querySelectorAll(sel)); }

  // ---------- Tabs ----------
  var tabBtns = $all("nav.tabs button");
  function showTab(id) {
    tabBtns.forEach(function (b) { b.classList.toggle("on", b.getAttribute("data-tab") === id); });
    $all("section.tab").forEach(function (s) { s.classList.toggle("on", s.id === id); });
    window.scrollTo({ top: 0, behavior: "instant" in window ? "instant" : "auto" });
  }
  tabBtns.forEach(function (b) {
    b.addEventListener("click", function () { showTab(b.getAttribute("data-tab")); });
  });

  // ---------- Section 1: chain diagram ----------
  var chainInfo = {
    inb: ["Inbound logistics", "Receiving, storing and handling inputs. At Little Caesars: one captive distributor, one truck, one negotiation."],
    ops: ["Operations", "Turning inputs into the product. At Little Caesars: made to a forecast, not to order, with ovens running at high utilization."],
    outb: ["Outbound logistics", "Getting the product to the buyer. At Little Caesars: carryout, then third-party delivery, then a self-service locker. No owned drivers."],
    mkt: ["Marketing and sales", "Making the buyer aware and willing to buy. At Little Caesars: a single $5 number that needs no explanation, which is cheaper to communicate."],
    svc: ["Service", "Keeping the buyer after the sale. At the Ritz-Carlton: staff may spend up to $2,000 on the spot to fix a guest problem."],
    inf: ["Firm infrastructure", "The general management, planning, finance and legal functions that run across the chain."],
    hr: ["Human resources", "Recruiting, training and retaining people across every activity."],
    tech: ["Technology development", "Process and product know-how. Hard to see from the outside, so surprises hide here."],
    proc: ["Procurement", "Buying the inputs. Often the least examined activity, and a place where the surprises hide."],
    margin: ["Profit margin", "What is left when the buyer's willingness to pay exceeds the collective cost of everything to the left."]
  };
  var detail = $("#detail");
  function setDetail(key) {
    var info = chainInfo[key];
    $all("#t1 [data-key]").forEach(function (el) { el.classList.toggle("on", el.getAttribute("data-key") === key); });
    detail.innerHTML = "<h3>" + info[0] + "</h3><p>" + info[1] + "</p>";
  }
  $all("#t1 [data-key]").forEach(function (el) {
    el.addEventListener("click", function () { setDetail(el.getAttribute("data-key")); });
    el.addEventListener("keydown", function (e) {
      if (e.key === "Enter" || e.key === " ") { e.preventDefault(); setDetail(el.getAttribute("data-key")); }
    });
  });
  setDetail("ops");

  // ---------- Steps (accordion) ----------
  $all("button[data-step]").forEach(function (btn) {
    btn.addEventListener("click", function () {
      var parent = btn.parentNode;
      var wasOpen = btn.classList.contains("open");
      $all("button[data-step]", parent).forEach(function (b) { b.classList.remove("open"); });
      if (!wasOpen) btn.classList.add("open");
    });
  });

  // ---------- Section 3: Little Caesars rows ----------
  var lcWhy = [
    "Captive supply means one negotiation for the whole system. Franchisees bought $1.64 billion through Blue Line in FY2021. That is one truck and one set of terms instead of many.",
    "A narrow menu and a forecast-based warming rack let the ovens run continuously. Smaller stores mean less rent, less equipment, less training, less energy.",
    "No drivers on payroll, no vehicle insurance, no driver scheduling risk. With the Portal, there is no counter transaction either.",
    "A price that needs no explanation is cheaper to communicate than an offer that does. The brand's $5 proposition ran for eighteen years."
  ];
  $all("#lcTable tbody tr").forEach(function (tr) {
    tr.addEventListener("click", function () {
      $all("#lcTable tbody tr").forEach(function (t) { t.style.background = ""; });
      tr.style.background = "var(--accent-soft)";
      $("#lcWhy").textContent = lcWhy[parseInt(tr.getAttribute("data-row"), 10)];
    });
  });

  // ---------- Linkage triad ----------
  var triadNotes = [
    "Narrow menu: a forecast over four products is tractable. A forecast over forty is not. Without this, made-ahead production breaks.",
    "Made-ahead production: delivers the throughput per labor hour that a low price needs. Without it, the price cannot cover labor.",
    "Low price: only works with a narrow menu, because variety is what a buyer demands when the price is high. Pull this out and the menu logic breaks too."
  ];
  $all("#triad .node").forEach(function (n) {
    n.addEventListener("click", function () {
      var i = parseInt(n.getAttribute("data-node"), 10);
      $all("#triad .node").forEach(function (x) { x.classList.toggle("on", x === n); });
      $("#triadNote").textContent = triadNotes[i];
    });
  });

  // ---------- Section 5: profit pool bars ----------
  var pool = [
    { name: "New vehicles", rev: 48.9, gp: 13.4 },
    { name: "Parts and service", rev: 17.5, gp: 47.6 },
    { name: "Finance and insurance (derived)", rev: 5.3, gp: 29.6 },
    { name: "Remaining (used and other)", rev: 28.3, gp: 9.4 }
  ];
  var poolBars = $("#poolBars");
  function renderPool(mode) {
    var html = "";
    pool.forEach(function (p) {
      var v = mode === "rev" ? p.rev : p.gp;
      var cls = mode === "rev" ? "" : " alt";
      html += '<div class="row"><span>' + p.name + '</span><div class="track"><span class="' + cls.trim() + '" style="width:' + v + '%"></span></div><span>' + v.toFixed(1) + '%</span></div>';
    });
    poolBars.innerHTML = html;
    $("#poolRev").className = mode === "rev" ? "btn" : "btn ghost";
    $("#poolGP").className = mode === "gp" ? "btn" : "btn ghost";
  }
  $("#poolRev").addEventListener("click", function () { renderPool("rev"); });
  $("#poolGP").addEventListener("click", function () { renderPool("gp"); });
  renderPool("rev");

  // ---------- Illustrative block map ----------
  // Each block: left = cumulative revenue share, width = revenue share, height from margin (illustrative).
  var blocks = [
    { label: "Activity A: wide, low margin", x: 0, w: 46, h: 22 },
    { label: "Activity B: narrow, high margin", x: 46, w: 14, h: 88 },
    { label: "Activity C: medium", x: 60, w: 26, h: 48 },
    { label: "Activity D: small, rich", x: 86, w: 14, h: 72 }
  ];
  var map = $("#blockMap");
  var mapH = 240;
  blocks.forEach(function (b) {
    var el = document.createElement("div");
    el.className = "blk";
    el.style.left = b.x + "%";
    el.style.width = b.w + "%";
    el.style.height = (b.h / 100 * mapH) + "px";
    el.style.bottom = "0";
    el.textContent = b.label;
    map.appendChild(el);
  });

  // ---------- Step 1 of pool method accordion already handled above ----------

  // ---------- Quiz reveal ----------
  var revealed = 0;
  var total = 0;
  $all("[data-reveal]").forEach(function (btn) {
    total++;
    btn.addEventListener("click", function () {
      var item = btn.closest(".q-item");
      if (item.classList.contains("revealed")) return;
      item.classList.add("revealed");
      btn.textContent = "Shown";
      btn.disabled = true;
      revealed++;
      $("#score").textContent = "Revealed " + revealed + " of " + total + ".";
    });
  });

  // ---------- Draw your own chain ----------
  var acts = [];
  function renderActs() {
    var ol = $("#actList");
    ol.innerHTML = "";
    acts.forEach(function (a, i) {
      var li = document.createElement("li");
      var span = document.createElement("span");
      span.textContent = a;
      var x = document.createElement("button");
      x.className = "x";
      x.setAttribute("aria-label", "Remove " + a);
      x.textContent = "x";
      x.addEventListener("click", function () { acts.splice(i, 1); renderActs(); });
      li.appendChild(span);
      li.appendChild(x);
      ol.appendChild(li);
    });
    $("#finalQ").style.display = acts.length >= 2 ? "block" : "none";
  }
  function addAct() {
    var input = $("#actIn");
    var v = (input.value || "").trim();
    if (!v) return;
    acts.push(v);
    input.value = "";
    renderActs();
    input.focus();
  }
  $("#addAct").addEventListener("click", addAct);
  $("#actIn").addEventListener("keydown", function (e) {
    if (e.key === "Enter") { e.preventDefault(); addAct(); }
  });
})();
</script>
</body>
</html>

