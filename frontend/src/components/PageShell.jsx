import React from "react";
import CloseButton from "./CloseButton";

export default function PageShell({ title = null, closeTo = -1, children }) {
  return (
    <div className="page-shell">
      <div className="page-header">
        <div className="page-header-left">
          {title ? <h2 className="page-title">{title}</h2> : null}
        </div>
        <div className="page-header-right">
          <CloseButton to={closeTo} />
        </div>
      </div>

      <div className="page-content container">
        {children}
      </div>
    </div>
  );
}
