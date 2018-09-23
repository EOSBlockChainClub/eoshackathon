import React, { Component } from 'react';
import Encrypt from './encrypt';
import Decrypt from './decrypt';
import Stats from './stats';

class Application extends Component {
    constructor(props) {
        super(props);

        this.state = {
            section: 'Stats'
        }

        this.changeSection = this.changeSection.bind(this);
    }

    changeSection(e) {
        this.setState({
            section: e.target.name
        });
    }

    getSection() {
        if (this.state.section == 'Stats') {
            return <Stats />;
        }

        if (this.state.section == 'Encrypt') {
            return <Encrypt />;
        }

        if (this.state.section == 'Decrypt') {
            return <Decrypt />
        }

        return null;
    }

    render() {
        const sections = ['Encrypt', 'Decrypt', 'Stats'];
        return (
            <div className="nav">
                {sections.map(section =>
                    <button key={section} className={section == this.state.section ? 'active' : 'inactive'} onClick={this.changeSection} name={section}>{section}</button>
                )}
                <div className="container">
                    {this.getSection()}
                </div>
            </div>
        );
    }
}

export default Application;
