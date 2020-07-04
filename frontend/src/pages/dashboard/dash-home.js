import React, { Component, Fragment as Frag } from 'react';
import { Link } from 'react-router-dom';
import axios from 'axios';

function hexToRgb(hex) {
	var result = /^#?([a-f\d]{2})([a-f\d]{2})([a-f\d]{2})$/i.exec(hex);
	return result ? {
		r: parseInt(result[1], 16),
		g: parseInt(result[2], 16),
		b: parseInt(result[3], 16)
	} : null;
}

class DashHome extends Component {
	constructor(props) {
		super(props);
		this.state = {user: null, data: null};
	}

	render() {
		var color = Math.floor(Math.random()*16777215).toString(16);
		var rgb = hexToRgb(color);
		var bg;
		if(rgb) bg = (rgb.r * 0.299) + (rgb.g * 0.587) + (rgb.b * 0.114) < 186 ? "white" : "black";
		else {
		  color = "000";
		  bg = "white"
		}

		return (
			<div className="App-container">
			<div className="App-header">
				<h1 className="App-title"><Link to="/">Sheep</Link></h1>
				<div className="App-navLinks">
				<a className="App-button" href="https://discordapp.com/api/oauth2/authorize?client_id=585271178180952064&permissions=8&scope=bot">invite</a>
				<a className="App-button" href="https://github.com/greys-bots/sheep">source</a>
				<a className="App-button" href="/docs">docs</a>
				<a className="App-button" href="/dash">dash</a>
				<a className="App-button" href="/generator">generator</a>
				</div>
			</div>
			<section className="App-about">
				<div>
				<p>
					Welcome to the Sheep web interface!{" "}
					This is currently a work in progress.{" "}
					Come back later to see the full dash finished! 
				</p>
				</div>
				<div style={{textAlign: "center"}}>
				<img className="App-sheep" src={"/sheep/"+color} alt="Sheep image" />
				</div>
			</section>
			</div>
		);
	}
}

export default DashHome;