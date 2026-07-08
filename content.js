/* ═══════════════════════════════════════════════════════════════
   UX-FIRST STUDIO — CONTENT LAYER
   ───────────────────────────────────────────────────────────────
   This is the only JS file a fork edits. Branding (CONFIG),
   stations & fields (STATIONS), the Lens (LENS_HTML), export
   prompt mapping (PROMPTS), and the seeded demo (DEMO_PROJECT)
   all live here. The engine (engine.js) never contains copy;
   this file never contains rendering or storage logic.

   FORK CHECKLIST — to fork this tool for a client or vertical:
   1. Copy the whole folder.
   2. Edit this file: CONFIG (name, tagline, accent trio, and
      IMPORTANT: storageKey — or saved data collides between
      forks hosted on the same origin), then stations / fields /
      prompts / demo as needed. The engine adapts. Keep station
      ids unique; field ids unique per station. PROMPTS maps
      fields → AI build prompts as [stationId, fieldId, label];
      update it if you rename ids.
   3. Edit manifest.webmanifest: name, short_name, description,
      theme_color / background_color if the palette changed.
   4. Regenerate the four icons in icons/ if the brand changed.
   5. Bump CACHE_VERSION in sw.js (treat a fork as v1.0.0 of a
      new app) — and on EVERY subsequent deploy, including pure
      content edits, or users never receive the change.
   6. Deploy to its own URL (subpath or subdomain per client).
   7. Verify: install it, launch in airplane mode, check the
      demo project seeds and all exports compile.
   ═══════════════════════════════════════════════════════════════ */

/* ---------- CONTENT LAYER · CONFIG ---------- */
var CONFIG = {
  toolName: "UX·First Studio",          // "·" renders as the accent dot
  tagline:  "Think before you build",
  accent:     "#1f44e0",
  accentDeep: "#15309e",
  accentWash: "#e8ecfd",
  storageKey: "uxfirst_studio_v1",      // CHANGE PER FORK
  appVersion: "1.2.2"                   // shown in sidebar fine print (§11)
};

/* ---------- CONTENT LAYER · STATIONS ---------- */
var STATIONS = [
  {
    id:"foundation", num:"00", foundation:true,
    kicker:"The substrate", title:"The Foundation",
    sub:"Clear reasoning and how minds work — beneath every other station.",
    sources:[["Being Logical","McInerny"],["Human Information Processing","Lindsay & Norman"]],
    learn:`
      <p class="lead">Every other station asks you to make a judgment. This one is about making those judgments <strong>sound</strong>. In a world where an AI hands you fluent, plausible output dozens of times a day, your reasoning is the only thing standing between "sounds right" and "is right."</p>

      <h3>Being Logical — think before you trust</h3>
      <p>McInerny's argument is that clear thinking starts before any argument: with <strong>clear, precise definitions</strong>. You cannot solve a problem you haven't defined, and you cannot judge a solution whose terms are fuzzy.</p>
      <div class="concept-card"><div class="cc-term">Define before you build</div><p>State the problem, and every key term in it, precisely enough that two people would agree on what counts as solving it. Vagueness at the start multiplies into chaos downstream.</p></div>
      <div class="concept-card"><div class="cc-term">Sound = valid form + true premises</div><p>An argument can be logically valid and still false if a premise is wrong. When the AI gives you a confident plan, ask both: is the reasoning valid, <strong>and</strong> are the assumptions it rests on actually true?</p></div>
      <p>The everyday failures are <strong>fallacies</strong> — reasoning that feels right but isn't. Learning to name them is how you catch them in your own thinking and in machine-generated text. The Lens panel lists the ones that bite builders most often.</p>

      <h3>Human Information Processing — why the rules work</h3>
      <p>Lindsay & Norman's classic maps the machinery beneath every usability heuristic: <strong>perception, attention, and memory</strong>. The friction rules later in this tool (chunk to 7±2, recognition over recall, limit choices) aren't arbitrary — they're consequences of how this machinery is built and where it's limited.</p>
      <div class="principle-list">
        <div class="pl-item"><span class="pl-key">ATTENTION</span><div class="pl-body">is <b>selective and scarce</b>. The user can only foreground one thing at a time. Every competing element taxes the same limited budget.</div></div>
        <div class="pl-item"><span class="pl-key">WORKING MEM</span><div class="pl-body">holds only a <b>handful of chunks</b> at once and decays fast. Anything you ask the user to hold in their head is a cost — offload it onto the screen.</div></div>
        <div class="pl-item"><span class="pl-key">RECOGNITION</span><div class="pl-body">is far cheaper than <b>recall</b>. Showing options beats making someone remember them. This is the cognitive root of nearly every "don't make me think" rule.</div></div>
        <div class="pl-item"><span class="pl-key">PATTERNS</span><div class="pl-body">The mind reaches for <b>familiar patterns</b> first. Conventional layouts feel effortless because recognition does the work perception otherwise would.</div></div>
      </div>
      <p>Knowing the <em>why</em> means you can reason about the situations the heuristics don't cover — instead of memorizing rules you can't extend.</p>
    `,
    fields:[]
  },
  {
    id:"whoWhy", num:"01",
    kicker:"Stage one", title:"Who & Why",
    sub:"Before anything else: whose progress are you serving, and what did they hire this to do?",
    sources:[["Competing Against Luck","Christensen"],["Badass","Kathy Sierra"]],
    learn:`
      <p class="lead">Cheap generation makes it easy to build the wrong thing fast. The only defense is starting from the human, not the feature.</p>

      <h3>Jobs to Be Done — people hire products to make progress</h3>
      <p>Christensen's reframe: nobody wants your product. They have a <strong>job arising in a circumstance</strong>, and they "hire" something to get it done. The famous case — people bought milkshakes to make a boring morning commute tolerable, not because they wanted a milkshake. Get the job right and the design follows.</p>
      <div class="principle-list">
        <div class="pl-item"><span class="pl-key">FUNCTIONAL</span><div class="pl-body">The practical task — <b>what they need accomplished</b>.</div></div>
        <div class="pl-item"><span class="pl-key">EMOTIONAL</span><div class="pl-body">How they want to <b>feel</b> while doing it — and how they want to avoid feeling.</div></div>
        <div class="pl-item"><span class="pl-key">SOCIAL</span><div class="pl-body">How it makes them <b>look to others</b>. Quietly powerful, often unspoken.</div></div>
      </div>

      <h3>Badass — the hero is the user, not the app</h3>
      <p>Kathy Sierra's insight cuts deeper: people don't want to be good at <em>using your tool</em>. They want to be good at <strong>the thing your tool enables</strong>. The photographer doesn't want to master your camera's menus — they want stunning photos. Design for the user's competence and confidence, and the product becomes the thing that made them awesome.</p>
      <div class="quote-band">"Don't build a better camera — build a better photographer."<span class="qb-attr">The Badass principle</span></div>
      <p>If your product makes the user more capable at something they already care about, it sells itself by word of mouth — because people recommend things that made <em>them</em> look good.</p>
    `,
    fields:[
      {id:"who",label:"Who is this for?",hint:"Be specific. Not 'small businesses' — a real person in a real situation. <b>The least-expert version</b> of them.",rows:2},
      {id:"job",label:"What job are they hiring it to do?",hint:"Finish: <b>“When ___ happens, I want to ___, so that ___.”</b> That's the job, in their words, not yours.",rows:2},
      {id:"dimensions",label:"Functional / emotional / social dimensions",hint:"What must it accomplish, how should it feel, and how does it make them look to others?",rows:3},
      {id:"awesome",label:"What does 'awesome' look like for them?",hint:"What does the user become <b>better at</b> because this exists? Describe the more-capable version of them.",rows:2},
      {id:"notthem",label:"What it is NOT for",hint:"Naming who you're not serving sharpens who you are. One or two lines.",rows:1}
    ],
    ai:"Is your AI feature serving the user's actual job — or is it AI-for-AI's-sake? Norman's warning in The Design of Future Things: automation added for its own sake creates new problems while solving none of the user's."
  },
  {
    id:"experience", num:"02",
    kicker:"Stage two", title:"The Experience",
    sub:"Design how it feels before a single line of code exists.",
    sources:[["The Design of Everyday Things","Norman"],["Hooked","Eyal"]],
    learn:`
      <p class="lead">You don't design a product. You design how it feels to use one. That feeling can be sketched, argued, and decided before code — and it's far cheaper to get right here than after.</p>

      <h3>Norman's vocabulary of usable things</h3>
      <p>The Design of Everyday Things gives you the words for why interfaces work or fail. Most "user error" is really <strong>design error</strong> — the design failed to communicate.</p>
      <div class="principle-list">
        <div class="pl-item"><span class="pl-key">AFFORDANCE</span><div class="pl-body">What actions a thing <b>makes possible</b>. A button affords pushing.</div></div>
        <div class="pl-item"><span class="pl-key">SIGNIFIER</span><div class="pl-body">The visible signal of <b>how to use it</b>. Without signifiers, affordances go undiscovered.</div></div>
        <div class="pl-item"><span class="pl-key">FEEDBACK</span><div class="pl-body">Immediate, visible response to <b>every action</b>. Silence breeds doubt and repeated clicks.</div></div>
        <div class="pl-item"><span class="pl-key">MAPPING</span><div class="pl-body">Controls should <b>correspond</b> to their effects — spatially, naturally. Up means more.</div></div>
        <div class="pl-item"><span class="pl-key">MODEL</span><div class="pl-body">The user's <b>mental model</b> of how it works must match how it actually works, or every action is a guess.</div></div>
      </div>

      <h3>Hooked — what makes them come back</h3>
      <p>Eyal's Hook Model explains engagement as a loop: <strong>Trigger → Action → Variable Reward → Investment</strong>. External triggers (a notification) give way to internal ones (an emotion). The action must be easy. The reward must carry a hint of <em>variability</em> — predictable rewards stop compelling. And a bit of user investment loads the next trigger.</p>
      <div class="concept-card"><div class="cc-term">Sequence matters</div><p>Habit-forming mechanics only matter <strong>once the core experience is genuinely good</strong>. Reach for the hook late, never as a substitute for value.</p></div>
    `,
    fields:[
      {id:"feel",label:"Describe the felt experience in one paragraph",hint:"Pretend it exists. What is it <b>like</b> to use? Calm? Fast? Reassuring? Write the feeling, not the features.",rows:3},
      {id:"first30",label:"The first 30 seconds",hint:"What does the user see, do, and feel in their first half-minute? This is where trust is won or lost (and where signifiers + feedback earn their keep).",rows:3},
      {id:"model",label:"The conceptual model",hint:"In one sentence, how should the user <b>picture</b> what this does? If their mental model and the real behaviour diverge, every action becomes a guess.",rows:2},
      {id:"hook",label:"The return loop (Hooked)",hint:"What internal trigger brings them back? What's the action, the variable reward, the small investment that loads the next visit?",rows:3}
    ],
    ai:"Does your AI signal what it is doing and why? Norman's central concern with intelligent systems is that they act without communicating — leaving the human unable to predict or trust them. Continuous, natural feedback about the AI's state is non-negotiable.",
    ethics:"<b>The Hooked ethics gate.</b> Eyal's own Manipulation Matrix asks two questions before you ship any engagement mechanic: <b>(1)</b> Would you use it yourself? <b>(2)</b> Does it materially improve the user's life? If the honest answer to either is no, you're building a vice, not a habit. Write your answer below."
  },
  {
    id:"shape", num:"03",
    kicker:"Stage three", title:"Shape & Scope",
    sub:"Define the problem precisely, and decide how much it's worth — before you commit.",
    sources:[["Shape Up","Singer / Basecamp"],["Being Logical","McInerny"]],
    learn:`
      <p class="lead">The danger of cheap generation is building the wrong thing efficiently. Scoping is the discipline that points the generation at the right target.</p>

      <h3>Shape Up — set an appetite, not an estimate</h3>
      <p>Singer's method flips the usual order. Instead of speccing every detail then estimating how long it takes, you decide <strong>how much time the problem is worth</strong> — the <em>appetite</em> — and then shape a solution that fits inside it. Time is fixed; scope flexes.</p>
      <div class="principle-list">
        <div class="pl-item"><span class="pl-key">SHAPE</span><div class="pl-body">Work the problem at the <b>right altitude</b> — concrete enough to be buildable, loose enough to leave room for the build.</div></div>
        <div class="pl-item"><span class="pl-key">APPETITE</span><div class="pl-body">"This is worth about <b>two days</b>" is a design constraint, not a guess. It forces hard trade-offs up front.</div></div>
        <div class="pl-item"><span class="pl-key">DE-RISK</span><div class="pl-body">Find the <b>rabbit holes and unknowns</b> before committing, not halfway through.</div></div>
      </div>

      <h3>Being Logical — the problem must be defined to be solved</h3>
      <p>McInerny again, applied directly: a problem you can't state in one clear sentence isn't a problem yet — it's a feeling. Define your terms. The sharper the definition, the more the solution designs itself. And explicitly naming what's <strong>out of scope</strong> is itself an act of clear definition.</p>
      <div class="quote-band">"Fixed time, variable scope. The clock doesn't move — the feature does."<span class="qb-attr">The Shape Up appetite</span></div>
    `,
    fields:[
      {id:"problem",label:"The problem in one precise sentence",hint:"If you can't state it in a single clear sentence, it isn't defined yet. Force it.",rows:2},
      {id:"terms",label:"Key terms, defined",hint:"Pick the 2–3 words your problem hinges on and define them so two people would agree what counts as solved.",rows:2},
      {id:"appetite",label:"Your appetite",hint:"How much time is this <b>worth</b> — an afternoon, two days, a week? State it as a constraint, then make scope fit.",rows:1},
      {id:"outscope",label:"Explicitly OUT of scope (v1)",hint:"List what you are deliberately <b>not</b> building yet. This is where most projects are saved.",rows:2},
      {id:"risks",label:"Rabbit holes & unknowns",hint:"What could swallow your time? Name the scary unknowns now so they don't ambush you later.",rows:2}
    ],
    ai:"Have you scoped what the AI does NOT do? An unbounded 'it'll figure it out' is the most expensive scope of all. Define the edges of the AI's autonomy, and decide where the human stays in the loop."
  },
  {
    id:"friction", num:"04",
    kicker:"Stage four", title:"Reduce Friction",
    sub:"Find every place the user has to stop and think — and remove it.",
    sources:[["Don't Make Me Think","Krug"],["Laws of UX","Yablonski"]],
    learn:`
      <p class="lead">Krug's whole philosophy in three words: <strong>don't make me think</strong>. Every moment of confusion spends down a finite reservoir of the user's goodwill.</p>

      <h3>How people actually use things</h3>
      <div class="principle-list">
        <div class="pl-item"><span class="pl-key">SCAN</span><div class="pl-body">People <b>don't read, they scan</b> for the first thing that looks like what they want.</div></div>
        <div class="pl-item"><span class="pl-key">SATISFICE</span><div class="pl-body">They pick the <b>first reasonable option</b>, not the best one. Optimizing is too much work.</div></div>
        <div class="pl-item"><span class="pl-key">GOODWILL</span><div class="pl-body">A <b>reservoir of goodwill</b> drains with every confusion and refills with every small success.</div></div>
      </div>
      <p>Krug's editing rule: get rid of half the words on each screen, then half of what's left. Most interfaces are drowning in text nobody reads.</p>

      <h3>The Laws of UX — named, checkable rules</h3>
      <div class="principle-list">
        <div class="pl-item"><span class="pl-key">HICK</span><div class="pl-body">Decision time grows with the <b>number and complexity of choices</b>. Fewer options, faster action.</div></div>
        <div class="pl-item"><span class="pl-key">FITTS</span><div class="pl-body">Time to hit a target depends on its <b>size and distance</b>. Make important things big and close.</div></div>
        <div class="pl-item"><span class="pl-key">JAKOB</span><div class="pl-body">Users spend most time on <b>other</b> sites — they expect yours to work the same way. Break convention only with reason.</div></div>
        <div class="pl-item"><span class="pl-key">MILLER</span><div class="pl-body">Working memory holds about <b>7±2 chunks</b>. Group and chunk; don't make them hold a list in their head.</div></div>
      </div>
    `,
    fields:[
      {id:"thinkpoints",label:"Where does the user have to think?",hint:"Walk the main flow. List every spot where they'd pause, squint, or wonder 'what now?' Each one is a target.",rows:3},
      {id:"choices",label:"Count the choices per screen (Hick)",hint:"On your busiest screen, how many decisions are you putting in front of them at once? What can you remove or defer?",rows:2},
      {id:"conventions",label:"Conventions you're breaking (Jakob)",hint:"Where does your design differ from what users already know? For each, is the difference earning its cost?",rows:2},
      {id:"cut",label:"What words can you cut?",hint:"Apply Krug's rule. What text on the main screen can be halved — then halved again — without losing meaning?",rows:2}
    ],
    ai:"Does the AI reduce friction, or add a new layer of 'what is it doing now?' An intelligent feature that leaves the user guessing has added a thinking-tax, not removed one. The AI must make the next step obvious, not mysterious."
  },
  {
    id:"legible", num:"05",
    kicker:"Stage five", title:"Make It Legible",
    sub:"You can reason about users perfectly and still ship something that looks amateur. This stage fixes that.",
    sources:[["Refactoring UI","Wathan & Schoger"]],
    learn:`
      <p class="lead">Refactoring UI is the single most useful craft book for a non-designer, because it's all concrete tactics — the moves that instantly lift the quality of anything you generate.</p>

      <h3>Start with hierarchy, not layout</h3>
      <p>The first question is never "where does this go?" but <strong>"what's the most important thing here?"</strong> Decide the one thing per screen, make it loud, and — the move beginners miss — actively <strong>de-emphasize</strong> everything else. Hierarchy is a contrast between elements, so muting the secondary is as important as boosting the primary.</p>
      <div class="principle-list">
        <div class="pl-item"><span class="pl-key">WEIGHT+COLOR</span><div class="pl-body">Establish hierarchy with <b>font weight and color</b>, not just size. A bold dark label and a light grey one separate cleanly at the same size.</div></div>
        <div class="pl-item"><span class="pl-key">SPACING</span><div class="pl-body">Start with <b>too much</b> whitespace and remove until it feels right. Cramped is the default failure; generous reads as considered.</div></div>
        <div class="pl-item"><span class="pl-key">SYSTEMS</span><div class="pl-body">Don't pick spacing and sizes ad hoc. Use a <b>limited scale</b> (e.g. 4 · 8 · 12 · 16 · 24) so everything aligns by default.</div></div>
        <div class="pl-item"><span class="pl-key">PALETTE</span><div class="pl-body">Limit your colors. <b>One accent</b>, a range of greys, and semantic colors for states. More palette = less polish.</div></div>
      </div>
      <div class="concept-card"><div class="cc-term">The fastest legibility win</div><p>Reduce, don't add. Most amateur screens look amateur because they have <strong>too much</strong> competing for attention — not too little decoration.</p></div>
    `,
    fields:[
      {id:"oneThing",label:"The ONE thing per key screen",hint:"For each main screen, name the single most important element. If everything's important, nothing is.",rows:2},
      {id:"deemphasize",label:"What gets de-emphasized",hint:"What's secondary that you'll actively mute (lighter, smaller, greyer) so the primary can lead?",rows:2},
      {id:"system",label:"Your spacing & type scale",hint:"Commit to a small set of spacing values and 2–3 text sizes. Write them down — this is what you'll hand the AI.",rows:2},
      {id:"palette",label:"Your palette",hint:"One accent, your greys, your state colors. Keep it tight. List them.",rows:2}
    ],
    ai:"Is the AI's state visible and legible? Can the user tell at a glance what it's confident about versus guessing? Norman: an intelligent system that hides its certainty forces the human to either over-trust or ignore it. Make uncertainty a first-class visual element."
  },
  {
    id:"structure", num:"06",
    kicker:"Stage six", title:"Structure It",
    sub:"Keep the architecture simple and changeable — the part most vibecoders skip, and the one that bites.",
    sources:[["A Philosophy of Software Design","Ousterhout"],["Atomic Design","Frost"]],
    learn:`
      <p class="lead">You don't need to write the code, but you need enough structural sense to ask the AI for the right shape — and to recognize when it's handing you something that'll be painful to extend.</p>

      <h3>Ousterhout — complexity is the enemy</h3>
      <p>The core thesis: <strong>complexity accumulates incrementally</strong>, a little at a time, until the system is too tangled to change safely. Fighting it is the whole job of design.</p>
      <div class="principle-list">
        <div class="pl-item"><span class="pl-key">DEEP MODULE</span><div class="pl-body">The ideal: <b>powerful functionality behind a simple interface</b>. A lot happens inside; little is exposed. Shallow modules (big interface, little behind it) are the enemy.</div></div>
        <div class="pl-item"><span class="pl-key">HIDE INFO</span><div class="pl-body">Each part should <b>hide its internals</b> so the rest of the system doesn't need to know — and isn't broken when they change.</div></div>
        <div class="pl-item"><span class="pl-key">DESIGN TWICE</span><div class="pl-body">The first structure that comes to mind is rarely best. <b>Sketch two</b> and compare — cheap insurance against a costly tangle.</div></div>
      </div>

      <h3>Frost — build from atoms up</h3>
      <p>Atomic Design gives you a composition mindset that maps perfectly onto prompting: <strong>atoms → molecules → organisms → templates → pages</strong>. Define small reusable pieces, then compose upward. A consistent set of atoms is what keeps an AI-built interface from drifting into a dozen slightly-different buttons.</p>
      <div class="quote-band">"A simple interface over powerful behaviour beats a powerful interface over simple behaviour, every time."<span class="qb-attr">The deep-module rule</span></div>
    `,
    fields:[
      {id:"atoms",label:"Your core components (atoms)",hint:"List the small reusable pieces — button, input, card, etc. This becomes your design-system instruction to the AI.",rows:2},
      {id:"deep",label:"Your deepest module",hint:"What's the one piece that should do a lot inside but expose a tiny, simple interface? Name it and its interface.",rows:2},
      {id:"creep",label:"Where will complexity creep in?",hint:"Be honest about the part most likely to tangle as it grows. Naming it now lets you defend against it.",rows:2},
      {id:"twice",label:"Design it twice — the alternative",hint:"Sketch a second structural approach in a line or two. Which wins, and why?",rows:2}
    ],
    ai:"Is the AI a deep module or a leaky one? Treat the model as a component: a simple, well-defined interface (clear inputs, clear outputs, clear failure behaviour) over powerful internals. A leaky AI module — where its quirks bleed into the rest of your app — is the hardest thing to maintain."
  },
  {
    id:"test", num:"07",
    kicker:"Stage seven", title:"Test & Iterate",
    sub:"Validate before you invest. Put it in front of real humans, fast.",
    sources:[["The Lean Startup","Ries"],["Sprint","Knapp"]],
    learn:`
      <p class="lead">Cheap generation makes the temptation to build everything overwhelming. The antidote is learning fast and cheap, before you commit.</p>

      <h3>Lean Startup — build, measure, learn</h3>
      <p>Ries's loop: build the smallest thing that produces <strong>validated learning</strong>, measure what real users do, and decide whether to persevere or pivot. The <strong>MVP</strong> isn't a small product — it's the smallest experiment that tests your riskiest assumption.</p>
      <div class="principle-list">
        <div class="pl-item"><span class="pl-key">RISKIEST</span><div class="pl-body">Find the <b>one assumption</b> that, if wrong, sinks everything. Test that first, not the easy stuff.</div></div>
        <div class="pl-item"><span class="pl-key">VALIDATED</span><div class="pl-body">Opinions aren't data. Learning counts only when it comes from <b>real behaviour</b>.</div></div>
        <div class="pl-item"><span class="pl-key">PIVOT</span><div class="pl-body">A change in direction based on what you learned is a <b>success of the method</b>, not a failure.</div></div>
      </div>

      <h3>Sprint — fake it before you build it</h3>
      <p>Knapp's five-day loop (map → sketch → decide → prototype → test) compresses months of debate into a week. The key trick: build a <strong>realistic façade</strong> — a prototype just real enough to fool a tester — and watch <strong>five people</strong> use it. Five is enough to surface most serious problems.</p>
      <div class="concept-card"><div class="cc-term">For a vibecoder</div><p>You can now generate that realistic façade in an afternoon. Use that speed to <strong>test ideas</strong>, not to ship untested ones faster.</p></div>
    `,
    fields:[
      {id:"riskiest",label:"Your riskiest assumption",hint:"What belief, if false, makes the whole thing pointless? Usually it's about the user, not the tech.",rows:2},
      {id:"smallest",label:"The smallest test of it",hint:"What's the cheapest thing you could build or show to learn whether that assumption holds? Think façade, not finished.",rows:2},
      {id:"know",label:"How you'll know it worked",hint:"Define the signal in advance. What behaviour from real people would count as validation — and what would count as a 'pivot'?",rows:2},
      {id:"five",label:"Your five testers",hint:"Who are five real people you can watch use it? Name them, or name how you'll find them.",rows:1}
    ],
    ai:"How will you detect the AI's failure modes, and calibrate the user's trust? Norman: the danger with intelligent systems is complacency — users over-trust a thing that's usually right until it quietly isn't. Test for the edge cases where it fails, and design how the user learns to trust it the right amount."
  }
];

var LENS_HTML = `
  <h3>Being Logical — the builder's checklist</h3>
  <p>Run any plan, or any AI-generated output, past these before you act on it.</p>
  <div class="check-row"><span class="check-mark">›</span><div class="cr-t"><b>Is it defined?</b> Can you state the problem and its key terms in one clear sentence?</div></div>
  <div class="check-row"><span class="check-mark">›</span><div class="cr-t"><b>Valid form?</b> Does the conclusion actually follow from the reasons given?</div></div>
  <div class="check-row"><span class="check-mark">›</span><div class="cr-t"><b>True premises?</b> Are the assumptions it rests on actually true — or just plausible?</div></div>
  <div class="check-row"><span class="check-mark">›</span><div class="cr-t"><b>Whole truth?</b> What's being left out that would change the picture?</div></div>

  <h3>Fallacies that bite builders</h3>
  <div class="fallacy"><b>Post hoc / false cause</b> — assuming one metric moved because of your change. Correlation isn't cause.</div>
  <div class="fallacy"><b>Appeal to popularity</b> — "everyone builds it this way," so it must be right.</div>
  <div class="fallacy"><b>Equivocation</b> — a key word quietly shifts meaning mid-argument (watch "user," "simple," "done").</div>
  <div class="fallacy"><b>Straw man</b> — refuting an easier version of an objection instead of the real one.</div>
  <div class="fallacy"><b>Hasty generalization</b> — one enthusiastic user is not your market.</div>

  <h3>Human Information Processing — the cognition quick-reference</h3>
  <p>The machinery beneath every friction rule.</p>
  <div class="check-row"><span class="check-mark">◦</span><div class="cr-t"><b>Attention is scarce.</b> One foreground at a time; everything else competes for the same budget.</div></div>
  <div class="check-row"><span class="check-mark">◦</span><div class="cr-t"><b>Working memory is tiny.</b> ~7±2 chunks, decaying fast. Offload onto the screen.</div></div>
  <div class="check-row"><span class="check-mark">◦</span><div class="cr-t"><b>Recognition beats recall.</b> Show, don't ask them to remember.</div></div>
  <div class="check-row"><span class="check-mark">◦</span><div class="cr-t"><b>Patterns first.</b> The mind reaches for the familiar — conventional layouts feel effortless for a reason.</div></div>

  <h3>The AI overlay — Design of Future Things</h3>
  <p>Because your products contain an autonomous collaborator, Norman's frontier concern threads through every station:</p>
  <div class="check-row"><span class="check-mark">◆</span><div class="cr-t"><b>Communicate intent.</b> The system must continuously signal what it's doing and why.</div></div>
  <div class="check-row"><span class="check-mark">◆</span><div class="cr-t"><b>Guard against complacency.</b> Usually-right breeds over-trust. Design for the moment it's wrong.</div></div>
  <div class="check-row"><span class="check-mark">◆</span><div class="cr-t"><b>Augment, don't just automate.</b> Keep the human capable and in the loop where it matters.</div></div>
`;

/* ---------- CONTENT LAYER · EXPORT PROMPT MAPPING ----------
   Each prompt compiles from [stationId, fieldId, label] lines.
   Prompts with no filled lines are skipped on export.          */
var PROMPTS = [
  {
    title:"PROMPT 1 · FRAME THE BUILD",
    intro:'I\'m building "{project}". Before writing code, hold to this UX-first frame.',
    lines:[
      ["whoWhy","who","User"],
      ["whoWhy","job","Job to be done"],
      ["whoWhy","awesome","Make the user awesome at"],
      ["experience","feel","It should feel"],
      ["experience","model","Conceptual model"]
    ],
    outro:"Acknowledge this frame, then ask me anything unclear before proceeding."
  },
  {
    title:"PROMPT 2 · SCOPE & GUARDRAILS",
    intro:"",
    lines:[
      ["shape","problem","Problem (one sentence)"],
      ["shape","terms","Key terms, defined"],
      ["shape","appetite","Appetite (time budget) — fixed time, variable scope"],
      ["shape","outscope","EXPLICITLY OUT OF SCOPE for v1"],
      ["shape","risks","Known rabbit holes to flag early"]
    ],
    outro:"Propose the smallest v1 that fits this appetite. Push back if I'm asking for more than the budget allows."
  },
  {
    title:"PROMPT 3 · ARCHITECTURE",
    intro:"",
    lines:[
      ["structure","atoms","Core reusable components (atoms)"],
      ["structure","deep","Make this a deep module (simple interface, powerful internals)"],
      ["structure","creep","Guard against complexity creeping in here"],
      ["structure","twice","Alternative structure considered, and why it lost"]
    ],
    outro:"Propose a file/component structure built from these atoms up. Favour deep modules and information hiding. Keep it changeable."
  },
  {
    title:"PROMPT 4 · BUILD THE INTERFACE",
    intro:"Build the UI to these constraints:",
    lines:[
      ["legible","oneThing","One thing per screen"],
      ["legible","deemphasize","De-emphasize"],
      ["legible","system","Spacing & type scale"],
      ["legible","palette","Palette"],
      ["friction","thinkpoints","Design away these friction points"],
      ["friction","choices","Keep choices minimal (Hick)"],
      ["friction","conventions","Conventions & deliberate exceptions (Jakob)"],
      ["friction","cut","Cut copy aggressively"]
    ],
    outro:"Hierarchy first, generous spacing, one accent colour. Don't make the user think."
  },
  {
    title:"PROMPT 5 · TEST PLAN",
    intro:"",
    lines:[
      ["test","riskiest","Riskiest assumption to validate"],
      ["test","smallest","Smallest test"],
      ["test","know","Success signal"],
      ["test","five","Testers"]
    ],
    outro:"Help me build the smallest realistic façade that tests the riskiest assumption with ~5 users."
  },
  {
    title:"NOTE · ENGAGEMENT & ETHICS",
    intro:"",
    lines:[
      ["experience","hook","Intended return loop"],
      ["experience","_ethics","Ethics check"]
    ],
    outro:"Only build engagement mechanics once the core value is proven."
  }
];

/* ---------- CONTENT LAYER · DEMO PROJECT ----------
   Seeded once on first run. Shows what good answers look like.
   Safe to delete in the UI — it won't come back.               */
const DEMO_PROJECT = {
  name:"QuickQuote (demo)",
  data:{
    whoWhy:{
      who:"Dario — a solo landscaper in his 40s. Gets 5–10 quote requests a week by text and voicemail, prices jobs from experience, and types quotes on his phone after dinner. Not tech-savvy; lives in SMS and photos.",
      job:"When a new lead texts me photos of their yard, I want to send a credible, priced quote within the hour, so that I win the job before a faster competitor does.",
      dimensions:"Functional: turn photos + a few inputs into a priced, sendable PDF quote. Emotional: relief — quoting at 9pm is the worst part of his week. Social: a clean branded quote makes a one-man operation look established.",
      awesome:"Dario becomes the fastest quoter in his area — from 'I'll get back to you tomorrow' to a professional quote in 10 minutes, sent from the truck.",
      notthem:"Not for landscaping companies with office staff or an existing CRM. Not an invoicing or scheduling tool."
    },
    experience:{
      feel:"Like texting a sharp assistant. Fast, forgiving, zero ceremony — big buttons, one screen, thumb-only. He should feel ahead of the job, not behind on paperwork.",
      first30:"Opens the app → 'New quote' is the only loud button → picks one of 6 job-type tiles → adds the lead's photos → a draft price appears instantly. First feeling: 'wait — that's it?'",
      model:"It's a price calculator that fills out the quote letter for you — change any number and the letter updates.",
      hook:"Internal trigger: the itch of an unanswered lead. Action: three taps to a draft. Variable reward: seeing which quotes come back as wins. Investment: every accepted quote tunes his price presets, so the next draft is sharper.",
      _ethics:"Yes on both counts — I'd use it nightly in his shoes. It relieves an existing anxiety rather than manufacturing one, and won income is a material improvement to his life."
    },
    shape:{
      problem:"Solo landscapers lose winnable jobs because producing a credible quote takes evening hours they don't have.",
      terms:"'Quote' = a priced, branded, sendable PDF — not an estimate range. 'Credible' = itemised labour + materials, not one bare number. 'Within the hour' = lead text to sent quote.",
      appetite:"Two weekends. If it doesn't fit, scope shrinks — the clock doesn't move.",
      outscope:"v1 skips: payments, scheduling, client accounts, AI photo measurement, native apps — web only.",
      risks:"PDF generation on mobile browsers; the price-preset model getting clever. Guard: presets stay a dumb editable table."
    },
    friction:{
      thinkpoints:"Choosing a job type when a job fits two tiles; entering measurements he may not know from photos; the pause before sending — can he trust the draft price?",
      choices:"New-quote screen implied 6 tiles + 4 fields + 2 buttons = 12 decisions. Defer everything but job type and size; defaults carry the rest.",
      conventions:"Quote layout follows standard invoice conventions on purpose. One deliberate break: the price is editable inline on the preview — unconventional, but it IS the product.",
      cut:"Tile labels: 'Lawn & Garden Maintenance Services' → 'Lawns'. Send confirmation halves twice down to: 'Quote sent.'"
    },
    legible:{
      oneThing:"New-quote screen: the job-type tiles. Preview screen: the total price. Send screen: the send button.",
      deemphasize:"Line-item detail collapses behind a 'breakdown' toggle; settings hide behind one quiet gear; branding footer is small and grey.",
      system:"Spacing: 4 / 8 / 16 / 24 / 40. Type: 16px body, 20px section, 34px price. Nothing else.",
      palette:"Ink #1a1a1a, paper #fafaf7, one green accent #2d7a4f (his brand colour), amber for 'draft' state. Red only on delete."
    },
    structure:{
      atoms:"Tile, Field, PriceRow, QuotePreview, BigButton, Sheet (bottom drawer).",
      deep:"QuoteEngine — in: job type + size + presets; out: a complete priced quote object. The UI never computes a price; it only displays what the engine returns.",
      creep:"The price-preset rules. Defence: presets remain a flat editable table — no conditional logic in v1, ever.",
      twice:"Alternative: a wizard, one question per screen. Rejected — Dario quotes the same 3 job types 90% of the time; one dense screen with strong defaults is faster after first use."
    },
    test:{
      riskiest:"That Dario trusts a tool's draft price enough to send it. If he re-prices every quote by hand, the speed promise is dead.",
      smallest:"A façade: a shared form + a hand-made PDF returned within 10 minutes by me, for 5 real quotes this week. Tests trust before a line of code exists.",
      know:"Validated if 4 of 5 quotes go out without re-pricing from scratch, and at least one wins the job. Pivot signal: drafts treated as 'starting points' and rebuilt every time.",
      five:"Dario, plus four landscapers from the regional trade Facebook group — free quotes for a week in exchange for letting me watch them use it."
    }
  }
};


/* ---------- CONTENT LAYER · AGENT CONTEXT ----------
   Compiles the project into a standing context file (CLAUDE.md /
   AGENTS.md) for AI coding agents. Same [stationId, fieldId, label]
   mapping as PROMPTS; empty lines and sections are skipped.        */
var AGENT_CONTEXT = {
  filename: "CLAUDE.md",
  intro: [
    "# {project} — UX-first project context",
    "",
    "Generated by UX-First Studio on {date}. This file is the standing frame for any",
    "AI coding agent working in this repo. Read it before proposing or writing code;",
    "when a request conflicts with it, say so instead of silently complying.",
    ""
  ].join("\n"),
  sections: [
    {
      title: "Who this serves",
      lines: [
        ["whoWhy","who","User"],
        ["whoWhy","job","Job to be done"],
        ["whoWhy","dimensions","Functional / emotional / social"],
        ["whoWhy","awesome","Make the user awesome at"],
        ["whoWhy","notthem","Not for"]
      ]
    },
    {
      title: "Intended experience",
      lines: [
        ["experience","feel","It should feel"],
        ["experience","first30","First 30 seconds"],
        ["experience","model","Conceptual model"],
        ["experience","hook","Return loop"]
      ]
    },
    {
      title: "Scope",
      lines: [
        ["shape","problem","Problem"],
        ["shape","terms","Key terms"],
        ["shape","appetite","Appetite"],
        ["shape","outscope","Out of scope (v1)"],
        ["shape","risks","Known rabbit holes"]
      ],
      note: "Fixed time, variable scope: when a request exceeds the appetite, push back instead of expanding scope."
    },
    {
      title: "Interface rules",
      lines: [
        ["legible","oneThing","One thing per screen"],
        ["legible","deemphasize","De-emphasize"],
        ["legible","system","Spacing & type scale"],
        ["legible","palette","Palette"],
        ["friction","thinkpoints","Friction points to design away"],
        ["friction","choices","Choice budget (Hick)"],
        ["friction","conventions","Conventions & deliberate exceptions"],
        ["friction","cut","Copy rules"]
      ],
      note: "Hierarchy first, generous spacing, one accent colour. Don't make the user think."
    },
    {
      title: "Architecture",
      lines: [
        ["structure","atoms","Core components (atoms)"],
        ["structure","deep","Deep module"],
        ["structure","creep","Complexity guard"],
        ["structure","twice","Alternative considered, and why it lost"]
      ],
      note: "Favour deep modules and information hiding. Keep it changeable."
    },
    {
      title: "Validation",
      lines: [
        ["test","riskiest","Riskiest assumption"],
        ["test","smallest","Smallest test"],
        ["test","know","Success signal"],
        ["test","five","Testers"]
      ]
    }
  ],
  outro: [
    "",
    "## Working agreements",
    "",
    "- Serve the job to be done above feature ideas; when in doubt, re-read \"Who this serves.\"",
    "- Respect the out-of-scope list — it is a decision, not an oversight.",
    "- Treat the interface rules as non-negotiable defaults; flag any deliberate exception.",
    "- Prefer the smallest change that produces validated learning.",
    ""
  ].join("\n")
};
