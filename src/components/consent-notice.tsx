const TOPICS = [
  {
    title: 'How this exam is monitored',
    body: (
      <>
        While you take this exam, your webcam is used to estimate where your
        head and eyes are pointed. The system looks for patterns such as
        repeatedly turning your head to the side or repeatedly looking away from
        your screen.
      </>
    ),
  },
  {
    title: "What is and isn't saved",
    body: (
      <>
        Your webcam video is not recorded, and no photos or screenshots are
        taken or saved. If the system notices a pattern, it saves a short note
        for your teacher: the time, the type of pattern, and the estimated head
        and eye movement readings.
      </>
    ),
  },
  {
    title: 'What a flag means',
    body: (
      <>
        A flag means <em>possible suspicious behavior</em>. It is not a finding
        that you did anything wrong. Looking away briefly to think or stretch is
        normal. Your teacher reviews every flag and decides what, if anything, it
        means. No penalty is applied automatically.
      </>
    ),
  },
]

export function ConsentNotice() {
  return (
    <section className="card card-blush space-y-6 text-sm">
      <div className="space-y-2">
        <span
          className="eyebrow"
          style={{ '--dot': '#d6aec1' } as React.CSSProperties}
        >
          Step 2 · Please read
        </span>
        <h2>Before you start</h2>
      </div>

      <div className="grid gap-4 md:grid-cols-2">
        {TOPICS.map((topic) => (
          <div
            key={topic.title}
            className="space-y-2 rounded-card border border-[#e6d6cc] bg-paper-white p-4"
          >
            <h3 className="text-base">{topic.title}</h3>
            <p>{topic.body}</p>
          </div>
        ))}

        <div className="space-y-2 rounded-card border border-[#e6d6cc] bg-paper-white p-4">
          <h3 className="text-base">What you should do</h3>
          <ul className="checklist">
            <li>
              Sit where your face is clearly visible to the webcam, with decent
              lighting.
            </li>
            <li>Keep your webcam enabled while monitoring is active.</li>
            <li>Ask your teacher if you have any questions before you begin.</li>
          </ul>
        </div>
      </div>

      <p className="font-medium">
        If you do not wish to enable webcam monitoring, please speak with your
        teacher before starting the examination to discuss an alternative
        arrangement.
      </p>
    </section>
  )
}
