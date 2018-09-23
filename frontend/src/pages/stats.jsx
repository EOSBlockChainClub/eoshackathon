import React, { Component } from 'react';
import Eos from 'eosjs';

class Stats extends Component {
    constructor(props) {
        super(props);

        this.state = {
            attendees: []
        }
    }

    componentDidMount() {
        // static event id, in reality would be retrieved from db
        const eid = 1;
        // get identities from local storage for demo
        const identities = JSON.parse(localStorage.getItem('identities'));
        // create some dummy data
        const attendees = [
            { location: 'Dublin, Ireland', gender: 'male', birthdate: '01/01/1990' },
            { location: 'Dublin, Ireland', gender: 'male', birthdate: '01/02/1988' },
            { location: 'Manchester, UK', gender: 'male', birthdate: '01/03/1989' },
            { location: 'Manchester, UK', gender: 'female', birthdate: '03/01/1991' }
        ];

        if (identities) {
            // iterator
            let found = null;

            const eos = Eos();
            eos.getTableRows({
              "json": true,
              "code": "txcid",   // contract who owns the table
              "scope": "txcid",  // scope of the table
              "table": "subscribes",    // name of the table as specified by the contract abi
              "limit": 1,
              "lower_bound": eid,
              "upper_bound": eid+1
            }).then(result => {
                result.rows.map((row) => {
                    row.ids.map((id) => {
                        found = identities.find((identity) => {
                            return identity.aid == id;
                        });

                        if (found) {
                            attendees.push(found);
                            this.setState({
                                attendees
                            });
                        }
                    });
                });
            });
        } else {
            this.setState({
                attendees
            });
        }
    }

    getAverageAge() {
        let ages = [];
        const now = new Date().getTime();
        this.state.attendees.map((attendee) => {
            let diff = now - new Date(attendee.birthdate).getTime();
            diff /= (60 * 60 * 24);
            ages.push(Math.abs(Math.round(diff/365.25)));
        });

        return ((ages.reduce((total, a) => total + a)/ages.length)/1000).toFixed(2);
    }

    getGenderProportions() {
        let proportions = { male: 0, female: 0 };
        this.state.attendees.map((attendee) => {
            attendee.gender == 'male' ? proportions.male += 1 : proportions.female += 1;
        });

        return proportions;
    }

    getTopLocation() {
        let arr = this.state.attendees.map(attendee => {
            return attendee.location;
        });

        return arr.sort((a,b) =>
            arr.filter(v => v===a).length
            - arr.filter(v => v===b).length
        ).pop();
    }

    getBarWidth(gProportions, key) {
        return (100 * gProportions[key]/this.state.attendees.length) + '%';
    }

    render() {
        if(this.state.attendees.length == 0) return null;
        const gProportions = this.getGenderProportions();
        return (
            <div>
                <div className="event-stat">
                    <h1>EOS Hackathon London statistics</h1>
                    <div className="statistics">
                        <h3>Average age</h3>
                        <span className="stat">{this.getAverageAge()} years old</span>
                        <h3>Gender distribution</h3>
                        <div id="chart">
                            {Object.keys(gProportions).map(key =>
                                <div className="bar" key={key} style={{width: this.getBarWidth(gProportions, key)}}>
                                    <span>{key}</span>
                                </div>
                            )}
                        </div>
                        <h3>Top location</h3>
                        <span className="stat">{this.getTopLocation()}</span>
                    </div>
                </div>
                <div className="event-stat">
                    <h1 style={{opacity: '.33'}}>EOS Hackathon Sydney statistics</h1>
                    <div style={{opacity: '.33'}} className="statistics">
                        <span>No data available</span>
                    </div>
                </div>
            </div>
        );
    }
}

export default Stats;
