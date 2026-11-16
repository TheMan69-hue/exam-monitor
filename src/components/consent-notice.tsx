export function ConsentNotice() {
  return (
    <section className="space-y-4 rounded-lg border border-blue-200 bg-blue-50 p-4 text-sm text-gray-800">
      <h2 className="text-base font-semibold text-gray-900">
        Before you start: please read
      </h2>

      <div className="space-y-1">
        <h3 className="font-medium">How this exam is monitored</h3>
        <p>
          While you take this exam, your webcam is used to estimate where your
          head and eyes are pointed. The system looks for patterns such as
          repeatedly turning your head to the side or repeatedly looking away
          from your screen.
        </p>
      </div>

      <div className="space-y-1">
        <h3 className="font-medium">What is and isn&apos;t saved</h3>
        <p>
          Your webcam video is not recorded, and no photos or screenshots are
          taken or saved. If the system notices a pattern, it saves a short note
          for your teacher: the time, the type of pattern, and the estimated head
          and eye movement readings.
        </p>
      </div>

      <div className="space-y-1">
        <h3 className="font-medium">What a flag means</h3>
        <p>
          A flag means <em>possible suspicious behavior</em>. It is not a finding
          that you did anything wrong. Looking away briefly to think or stretch
          is normal. Your teacher reviews every flag and decides what, if
          anything, it means. No penalty is applied automatically.
        </p>
      </div>

      <div className="space-y-1">
        <h3 className="font-medium">What you should do</h3>
        <ul className="list-disc space-y-1 pl-5">
          <li>
            Sit where your face is clearly visible to the webcam, with decent
            lighting.
          </li>
          <li>Keep your webcam enabled while monitoring is active.</li>
          <li>Ask your teacher if you have any questions before you begin.</li>
        </ul>
      </div>

      <p className="font-medium">
        If you do not wish to enable webcam monitoring, please speak with your
        teacher before starting the examination to discuss an alternative
        arrangement.
      </p>
    </section>
  )
}