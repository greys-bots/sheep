import React, {Component} from 'react';

class Command extends Component {
	constructor(props) {
		super(props);

		this.state = {cmd: this.props.cmd, show: false, last: false};
		this.subref = React.createRef();
		this.ref = React.createRef();
	}

	toggleSubcommands() {
		if(this.state.cmd.subcommands) {
			this.setState({show: !this.state.show, last: this.state.show}, ()=> {
				if(this.state.show) window.scrollTo(0, this.subref.current.offsetTop-10);
				else window.scrollTo(0, this.ref.current.offsetTop);
			});
		}
	}

	render() {
		var show = this.state.show;
		var cmd = this.state.cmd;
		if(!cmd.module) cmd.module = {};
		if(show) var subcommands = cmd.subcommands;
		
		return (
			<div ref={this.ref} className={`App-command ${show ? 'active' : ''}`} style={{cursor: cmd.subcommands ? 'pointer' : 'default'}} onClick={()=>this.toggleSubcommands()}>
			<div className="App-commandInner">
				<div>{cmd.name} (aliases: {cmd.alias ? cmd.alias.join(", ") : "[none]"})
				{cmd.subcommands &&
					<p>Click to toggle subcommands</p>
				}
				</div>
				<div dangerouslySetInnerHTML={{__html: 
											cmd.help +
											`<br/><br/>
											<div class='App-extras'>
											<span class='App-extra'><strong>Module:</strong> ${cmd.module.name || "unsorted"}</span>
                  							${cmd.permissions ?
                  								"<span class='App-extra'><strong>Permissions:</strong> "+cmd.permissions.join(', ')+"</span>" :
                  								""
                  							}
                  							${cmd.guildOnly ?
                  								"<span class='App-extra'><strong>Guild only</strong></span>" :
                  								""
                  							}
											</div>`
										}}>
											</div>
				<div dangerouslySetInnerHTML={{ __html: cmd.usage.join('<hr/>')}}></div>
			</div>
			{cmd.subcommands && cmd.subcommands.map((c, i) => {
				return(
					<div className="App-commandInner App-subcommand" ref={i == 0 && this.subref} >
					<div>{c.name} (aliases: {c.alias ? c.alias.join(", ") : "[none]"})</div>
					<div dangerouslySetInnerHTML={{__html: 
												c.help +
												`<br/><br/>
												<div class='App-extras'>
												<span class='App-extra'><strong>Module:</strong> ${cmd.module.name || "unsorted"}</span>
	                  							${c.permissions ?
	                  								"<span class='App-extra'><strong>Permissions:</strong> "+c.permissions.join(', ')+"</span>" :
	                  								""
	                  							}
	                  							${c.guildOnly ?
	                  								"<span class='App-extra'><strong>Guild only</strong></span>" :
	                  								""
	                  							}
												</div>`
											}}>
												</div>
					<div dangerouslySetInnerHTML={{ __html: c.usage.join('<hr/>')}}></div>
				</div>
				);
			})}
			</div>
		);
	}
}

export default Command;