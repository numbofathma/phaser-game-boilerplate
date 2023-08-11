import LogoImgUrl from './../../assets/images/logo-game-white.png';
import SplashImgUrl from './../../assets/images/splash.jpg';
import './Splash.css';

export default function Splash(): JSX.Element {
  return (
    <div className="splash" style={{ backgroundImage: `url(${SplashImgUrl})` }}>
      <div className="logo">
        <img src={LogoImgUrl} className="logo-img" />
      </div>
    </div>
  );
}
