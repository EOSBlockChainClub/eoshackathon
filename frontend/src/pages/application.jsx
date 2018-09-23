import React, { Component } from 'react';
import Encrypt from './encrypt';
import Decrypt from './decrypt';
import Stats from './stats';

const sectionNames = {
    Stats: 'Statistics',
    Encrypt: 'Encrypt your profile',
    Decrypt: 'Your events',
    Advanced: 'Advanced analytics (coming soon)'
}

class Application extends Component {
    constructor(props) {
        super(props);

        this.state = {
            section: 'Encrypt',
            tab: 'user'
        }

        this.changeSection = this.changeSection.bind(this);
        this.switchTab = this.switchTab.bind(this);
    }

    changeSection(e) {
        this.setState({
            section: e.target.name
        });
    }

    getSection() {
        if (this.state.tab == 'organizer') {
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

    switchTab() {
        const tab = this.state.tab == 'user' ? 'organizer' : 'user';
        const section = tab == 'organizer' ? 'Stats' : 'Encrypt';
        this.setState({
            tab,
            section
        });
    }

    render() {
        const sections = this.state.tab == 'user' ? ['Encrypt', 'Decrypt'] : ['Stats', 'Advanced'];
        return (
            <div>
                <a href="javascript:;" className="change-section" onClick={this.switchTab}>{this.state.tab == 'user' ? 'Switch to organizer view' : 'Switch to user view'}</a>
                <div className="nav">
                    {sections.map(section =>
                        <button key={section} className={section == this.state.section ? 'active' : 'inactive'} onClick={this.changeSection} name={section}>{sectionNames[section]}</button>
                    )}
                    <div className="container">
                        {this.getSection()}
                    </div>
                </div>
            </div>
        );
    }
}

export default Application;
