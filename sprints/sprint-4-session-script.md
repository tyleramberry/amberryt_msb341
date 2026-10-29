# Sprint 4 session script: no-help run

For each of the three people in [`sprint-4-recruiting.md`](sprint-4-recruiting.md). The test is
whether they get from the link to a winner **without me**. My job is to watch, record, and keep
quiet. Log anything I do in the intervention log
([`../discovery/interviews/sprint-4-intervention-log-template.md`](../discovery/interviews/sprint-4-intervention-log-template.md)).

About 40 minutes: 5 intro, up to 25 run, 10 questions.

## Before the session

- [ ] Engine is live: open https://personal-bench.homeroom-app.workers.dev and check it loads.
- [ ] Their app matches the setup page's instructions (Claude, or the ChatGPT path if they use
      ChatGPT). If the page has no path for their app yet, reschedule rather than help.
- [ ] Recorder ready (screen + audio). Consent confirmed in the screener.
- [ ] Copy of the intervention log open, with their code (P1, P2, P3) filled in.
- [ ] Owner log at `/admin` ready, so I can find their run afterward.
- [ ] Clock or timer to note times.

## 1. Intro (read this, about 2 minutes)

> Thanks for doing this. I'm testing a tool called MySI. It finds out which AI model is best at
> the things *you* use AI for. You'll set it up yourself in [your app], tell it about a couple of
> things you use AI for, and pick the answers you like best without knowing which AI wrote them.
> At the end it tells you which one won.
>
> I'm testing the tool, not you. If something is confusing, that's the tool's fault, and it's
> exactly what I need to see. I'm going to stay quiet and not help, even if you get stuck. Please
> think out loud as you go: say what you're looking at and what you expect to happen.
>
> If you really can't go on, say "I'm stuck" and I'll step in, but then I'll note it. Ready? I'm
> starting the recording.

Start the recording. Note the start time.

## 2. Hand-off (the only help allowed)

Send exactly this, and nothing else:

> https://personal-bench.homeroom-app.workers.dev

That's it. The page and the prompt it copies are the "connect prompt" the plan allows. Everything
else they figure out on their own.

## 3. During the run: what I do

**Say nothing.** If they ask me a question, answer once with:

> What would you try if I weren't here?

That line is not an intervention. Anything beyond it is.

**These count as interventions** (log each one, with the time and exact words):

- Telling them what to click, type, or say ("just say confirm").
- Pointing at the screen or nodding toward the right button.
- Explaining what something means ("that's the connector").
- Fixing anything on their machine or in their account.
- Re-sending a link, a prompt, or an instruction.
- Answering a question about the tool beyond the redirect line.

**Only step in when** they say "I'm stuck," or they've made no progress for 5 minutes, or
something is broken (engine error, page won't load). When I step in, give the smallest help that
unblocks them, log it, then go quiet again. The run still finishes, it just doesn't count as
no-help.

**Watch and note (no talking):**

| Step | What to note |
|---|---|
| Setup page | Did they find the button? Did the copy work? Time to paste. |
| Adding the connector | Which path (app settings or the app adding it)? Where did they pause? Did they hit "Always allow"? |
| First sentence | Did they say "Find my best AI model" or something else? Did the app call MySI? |
| Interview | Did they come up with 2+ tasks? How long? Did they write criteria in their own words? |
| Rating page | Did they find it? Best and worst picks, and their comments out loud. |
| Results | What did they say when the winner showed up? Did they read the "in your app" line and the snippet? |

Note the end time when results appear, or when they give up.

## 4. After the run: questions (about 10 minutes)

Stop the run before asking. Keep the recording on. Ask in this order and let them answer fully
before moving on. Follow up with "why?" or "tell me more" only.

**Did they finish unassisted** (my notes answer this, but ask their side):

1. Where, if anywhere, did you feel stuck or unsure what to do?
2. If I hadn't been here, would you have finished? Where would you have quit?

**Did their picks differ by task** (the run data answers this; ask what they noticed):

3. Did one AI feel best at everything, or did it change between your tasks?
4. Anything you picked as best that you'd still change? Why?

**What would they do with the result** (listen for: switch apps, change a setting or model, or
ignore it):

5. MySI said [winner] was best for you. What, if anything, will you do with that?
6. Would you switch to a different app for it? Would you change the model in [your app]?
7. Did you look at the instruction snippet? Would you paste it anywhere?

**Would they pay or come back:**

8. If a new AI model came out next month, would you want MySI to re-test it on your tasks?
9. Would you pay for this? If yes, about how much, and how often? If no, what would make it worth
   paying for?
10. Who else do you know who'd want this?

Close:

> That's everything. Thank you, this helps a lot. Is there anything else you want to tell me
> about it?

## 5. Right after (same day)

- [ ] Finish the intervention log while it's fresh. Mark the run counts or doesn't count.
- [ ] Find their run id in `/admin` and export the run.
- [ ] Write it up from
      [`../discovery/interviews/sprint-4-interview-template.md`](../discovery/interviews/sprint-4-interview-template.md),
      saved as `discovery/interviews/YYYY-MM-DD-interview-0N.md`. No real names.
- [ ] Update the tracker in `sprint-4-recruiting.md`.
