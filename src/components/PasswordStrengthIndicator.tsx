// @ts-ignore
import React from "react";
import "bootstrap/dist/css/bootstrap.css";
import zxcvbn from "zxcvbn";

// @ts-ignore
function PasswordStrengthMeter({ password, setisPasswordStrength }) {
  const Result = zxcvbn(password);
  const nums = (Result.score * 100) / 4;

  const funcProgressColor = () => {
    switch (Result.score) {
      case 0:
        return "#828282";
      case 1:
        return "#EA1111";
      case 2:
        return "#FFAD00";
      case 3:
        return "rgb(17, 155, 58)";
      case 4:
        return "rgb(20, 225, 20)";
      default:
        return "none";
    }
  };

  const funcTextColor = () => {
    switch (Result.score) {
      case 0:
        return "";
      case 1:
        return "";
      case 2:
        return "";
      case 3:
        return "";
      case 4:
        return "";
      default:
        return "";
    }
  };
  const funcProgressisPasswordStrength = () => {
    switch (Result.score) {
      case 0:
        return setisPasswordStrength(false);
      case 1:
        return setisPasswordStrength(false);
      case 2:
        return setisPasswordStrength(true);
      case 3:
        return setisPasswordStrength(true);
      case 4:
        return setisPasswordStrength(true);
      default:
        return setisPasswordStrength(false);
    }
  };
  funcProgressisPasswordStrength();

  const ChangePasswordColor = () => ({
    width: nums + "%",
    background: funcProgressColor(),
  });

  return (
    <div style={{ marginTop: 0 }}>
      <div
        className="progress"
        style={{
          height: "10px",
          borderRadius: "1px",
          position: "relative",
          overflow: "hidden",
        }}
      >
        <div className="progress-bar" style={ChangePasswordColor()}></div>
      </div>
      {funcTextColor() != "" ? (
        <p style={{ color: funcProgressColor(), textAlign: "end" }}>
          {funcTextColor()}
        </p>
      ) : null}
    </div>
  );
}

export default PasswordStrengthMeter;
