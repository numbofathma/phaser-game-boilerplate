import './Throbber.css';

export default function Throbber(): JSX.Element {
  return (
    <>
      <div id="loading-throbber-msg"></div>
      <div id="loading-throbber">
        <div className="lds-ellipsis">
          <div></div>
          <div></div>
          <div></div>
          <div></div>
        </div>
      </div>
    </>
  );
}
