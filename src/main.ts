import Game from './Game'
import './style.css'
import Havok from "@babylonjs/havok"

globalThis.HK = await Havok();

new Game(document.querySelector<HTMLCanvasElement>('#render')!)