import { theme, fontDisplay } from '../../../theme';
import { Modal, Spinner } from '../../../components/shared';

export function GradeDetailModal({ gradeDetail, loading, onClose }) {
  return (
    <Modal title={gradeDetail ? `${gradeDetail.quiz_title} — Detail` : 'Loading…'} onClose={onClose}>
      {loading ? (
        <Spinner label="Loading detail…" />
      ) : gradeDetail.status === 'pending' ? (
        <div style={{ padding: '20px 0', textAlign: 'center', color: theme.accent4, fontSize: 14 }}>
          <div style={{ fontSize: 32, marginBottom: 10 }}>⏳</div>
          <div style={{ fontWeight: 600 }}>{gradeDetail.message}</div>
          <div style={{ color: theme.textMuted, fontSize: 12, marginTop: 6 }}>{gradeDetail.course_title}</div>
        </div>
      ) : (
        <>
          <div style={{ display: 'flex', gap: 12, marginBottom: 20 }}>
            <div style={{ flex: 1, background: theme.surface2, borderRadius: theme.radiusSm, padding: '10px 14px', textAlign: 'center' }}>
              <div style={{ fontSize: 10, color: theme.textDim, textTransform: 'uppercase', letterSpacing: 0.8, marginBottom: 4 }}>Score</div>
              <div style={{ fontFamily: fontDisplay, fontSize: 28, color: gradeDetail.score >= 70 ? theme.accent3 : gradeDetail.score >= 50 ? theme.accent4 : theme.accent5 }}>
                {parseFloat(gradeDetail.score || 0).toFixed(1)}%
              </div>
            </div>
            <div style={{ flex: 1, background: theme.surface2, borderRadius: theme.radiusSm, padding: '10px 14px', textAlign: 'center' }}>
              <div style={{ fontSize: 10, color: theme.textDim, textTransform: 'uppercase', letterSpacing: 0.8, marginBottom: 4 }}>Course</div>
              <div style={{ fontSize: 13, color: theme.text, fontWeight: 600 }}>{gradeDetail.course_title}</div>
            </div>
          </div>
          {gradeDetail.overall_feedback && (
            <div style={{ padding: '10px 14px', marginBottom: 16, borderRadius: theme.radiusSm, background: 'rgba(108,143,255,0.1)', border: '1px solid rgba(108,143,255,0.25)', fontSize: 13, color: theme.text }}>
              📝 {gradeDetail.overall_feedback}
            </div>
          )}
          <div style={{ borderTop: `1px solid ${theme.border}`, paddingTop: 12 }}>
            {gradeDetail.answers?.map((a, i) => {
              const isPending = a.is_correct === null || a.is_correct === undefined;
              const isCorrect = a.is_correct === true;
              return (
                <div key={a.answer_id} style={{ padding: '10px 0', borderBottom: `1px solid ${theme.border}` }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: 8, fontWeight: 600, fontSize: 13, marginBottom: 4 }}>
                    <span>Q{i + 1}. {a.question_text}</span>
                    {isPending && (
                      <span style={{
                        fontSize: 9, fontWeight: 700, padding: '2px 6px', borderRadius: 4,
                        background: 'rgba(251,176,64,0.20)', color: '#a06400'
                      }}>
                        ⏳ PENDING REVIEW
                      </span>
                    )}
                  </div>
                  <div style={{ fontSize: 12, color: theme.textMuted, marginBottom: 2 }}>
                    Your answer: <strong style={{ color: theme.text }}>{a.user_answer || '(no answer)'}</strong>
                  </div>
                  {!isPending && a.correct_answer && !isCorrect && (
                    <div style={{ fontSize: 12, color: theme.accent3, marginBottom: 2 }}>
                      Correct: <strong>{a.correct_answer}</strong>
                    </div>
                  )}
                  <div style={{
                    fontSize: 12,
                    color: isPending ? '#a06400' : (isCorrect ? theme.accent3 : theme.accent5),
                    marginBottom: 2
                  }}>
                    {isPending ? '⏳ Awaiting instructor review' : (isCorrect ? '✓ Correct' : '✗ Incorrect')}
                    {' · '}{a.score_awarded ?? 0}/{a.max_points} pts
                  </div>
                  {a.auto_feedback && (
                    <div style={{ fontSize: 12, color: theme.textMuted, marginTop: 4, background: theme.surface2, padding: '6px 10px', borderRadius: 6 }}>
                      💡 {a.auto_feedback}
                    </div>
                  )}
                </div>
              );
            })}
          </div>
        </>
      )}
    </Modal>
  );
}
