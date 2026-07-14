export default function PageTitle({ icon: Icon, title, subtitle, action }) {
  return (
    <div className="page-title">
      <div className="title-lockup">
        {Icon && <span className="title-icon"><Icon size={22} /></span>}
        <div>
          <h1>{title}</h1>
          <p>{subtitle}</p>
        </div>
      </div>
      {action && <div className="title-action">{action}</div>}
    </div>
  );
}