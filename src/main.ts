import Game from './Game'
import './style.css'
import * as CANNON from 'cannon'

window.CANNON = CANNON

new Game(document.querySelector<HTMLCanvasElement>('#render')!)