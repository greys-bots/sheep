import React, { Component, Fragment as Frag } from 'react';
import * as tc from 'tinycolor2';

import Header from '../components/header';

class Generator extends Component {
	constructor() {
		super();

		this.state = {
			color: '',
			type: 'sheep',
			info: false,
			text: '',
			img: null,
			sheepcolor: tc.random().toHex()
		};
	}

	handleInput(e) {
		var target = e.target;
		switch(target.name) {
			case 'color':
			case 'type':
			case 'text':
				this.setState(state => {
					state[target.name] = target.value;
					return state;
				});
				break;
			case 'info':
				this.setState({info: target.checked});
				break;
		}
	}

	handleSubmit(e) {
		e.preventDefault();
		var {color, type, info, text} = this.state;
		var img = `/${type}/${color}`;
		if(info && text) img += `?info&text=${encodeURIComponent(text)}`;
		else if(text) img += `?text=${encodeURIComponent(text)}`;
		else if(info) img += `?info`;

		this.setState({img});
	}

	render() {
		console.log(this.state);
		return (
			<div className="App-container">
			<Header />
			<section className="App-about">
            	<div>
	            <p>
	            	Welcome to the Sheep image generator!{" "}
	            	You can use this page to generate colored{" "}
	            	images. No credit is required to use them!
	            </p>
	            </div>
	            <div style={{textAlign: "center"}}>
	            <img className="App-sheep" src={"/sheep/"+this.state.sheepcolor} alt="Sheep image" />
	            </div>
            </section>
            <div className="App-generator">
            <form onSubmit={(e) => this.handleSubmit(e)}>
            <label for="color">Color: </label>
            <br/>
            <input
            	type="text"
            	name="color"
            	value={this.state.color}
            	placeholder="Color"
            	onChange={(e) => this.handleInput(e)}
            />
            <br/>
            <br/>

            <span>Image type: </span>
            <br/>
            <input
            	type="radio"
            	name="type"
            	id="sheep"
            	value="sheep"
            	checked={this.state.type == 'sheep' ? true : false}
            	onChange={(e) => this.handleInput(e)}
            />
            <label for="sheep">Sheep</label>
            <br/>
            <input
            	type="radio"
            	name="type"
            	id="color"
            	value="color"
            	checked={this.state.type == 'sheep' ? false : true}
            	onChange={(e) => this.handleInput(e)}
            />
            <label for="color">Color</label>
            <br/>
            <br/>

            <label for="text">
            	Image text:{" "}
            	{this.state.type == 'sheep' &&
        		<span className="App-warning">
        		(Image type set to <strong>sheep</strong>.{" "}
        		This text will be hidden.)
        		</span>}
            </label>
            <br/>
            <input disabled={this.state.type == 'sheep'}
            	type="text"
            	name="text"
            	value={this.state.text}
            	placeholder="Image text"
            	onChange={(e) => this.handleInput(e)}
            />
            <br/>
            <br/>

            <input
            	type="checkbox"
            	name="info"
            	checked={this.state.info}
            	onChange={(e) => this.handleInput(e)}
            />
            <label for="info">Show color info? </label>
            <br/>
            <br/>

            <button>Generate!</button>
            </form>

            {this.state.img && (
            	<Frag>
            	<a href={this.state.img} target="_blank">
            	<img src={this.state.img} alt="Generated image"/>
            	</a>
            	<p>(Click for direct link!)</p>
            	</Frag>
            )}
            </div>
            </div>
		)
	}
}

export default Generator;