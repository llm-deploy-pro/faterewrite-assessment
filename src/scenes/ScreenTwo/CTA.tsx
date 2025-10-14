type Props = { label: string; onClick?: () => void };

export default function CTA({ label, onClick }: Props) {
  return (
    <button className="z2-btn" onClick={onClick} aria-label={label}>
      {label}
      <style>{`
        .z2-btn{
          width:100%;
          padding:16px 20px;
          border:none; border-radius:10px;
          background:#C9A961; color:#1C1C1E;
          font-weight:600; line-height:1;
        }
      `}</style>
    </button>
  );
}
