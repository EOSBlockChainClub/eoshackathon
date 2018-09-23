import React, { Component } from 'react';
import CryptoJS from 'crypto-js';
import Eos from 'eosjs';

class Decrypt extends Component {
    constructor(props) {
        super(props);

        this.state = {
            id: '',
            password: '',
            confirmation: false,
            encryptedIdentity: {},
            eosKey: '',
            eosName: ''
        }

        this.onChange = this.onChange.bind(this);
        this.showConfirmation = this.showConfirmation.bind(this);
        this.onSave = this.onSave.bind(this);
    }

    componentDidMount() {
        // uid should be retrieved from database here
        const uid = parseInt(localStorage.getItem('uid'));
        const eos = Eos();
        eos.getTableRows({
          "json": true,
          "code": "txcid",   // contract who owns the table
          "scope": "txcid",  // scope of the table
          "table": "iidentities",    // name of the table as specified by the contract abi
          "limit": 1,
          "lower_bound": uid,
          "upper_bound": uid+1
        }).then(result => this.setState({ encryptedIdentity: result.rows[0] }));
    }

    onChange(e) {
        const key = e.target.name;
        const state = Object.assign({}, this.state);
        state[key] = e.target.value;
        this.setState({
            ...state
        });
    }

    showConfirmation() {
        this.setState({
            confirmation: true
        });
    }

    async onSave(e) {
        e.preventDefault();
        const uid = parseInt(localStorage.getItem('uid'));
        // use static event id in reality this would come from the db
        const eid = 1;
        const anonymousId = Math.floor(Math.random() * 1000);
        let identity = {};
        ["location", "gender", "salt", "birthdate"].map((key) => {
            const bytes  = CryptoJS.AES.decrypt(this.state.encryptedIdentity[key], this.state.password);
            identity[key] = bytes.toString(CryptoJS.enc.Utf8);
        });
        identity.aid = anonymousId;

        if (identity.salt != '1337') return false;

        localStorage.setItem('identities', JSON.stringify([identity]));

        const eos = Eos({keyProvider: this.state.eosKey});
        const result = await eos.transaction({
          actions: [{
            account: 'txcid',
            name: 'subscribe',
            authorization: [{
              actor: this.state.eosName,
              permission: 'active',
            }],
            data: {
                owner: this.state.eosName,
                eventid: eid,
                id: anonymousId
            }
          }],
        });

        console.log(result);
    }

    render() {
        return (
            <div>
                {!this.state.confirmation &&
                    <div className="event-info">
                        <div className="event-pic"></div>
                        <div className="event-other">
                            <h1>EOS Hackathon London</h1>
                            <div className="info-container">
                                <i className="fas fa-map-marker"></i>
                                <span className="info-text">Wembley stadium</span>
                            </div>
                            <div className="info-container">
                                <i className="fas fa-calendar"></i>
                                <span className="info-text">September 28th, 2018</span>
                            </div>
                            <div className="info-container">
                                <i className="fas fa-clock"></i>
                                <span className="info-text">18:00</span>
                            </div>
                            <div className="info-container">
                                <i className="fas fa-info"></i>
                                <span className="info-text">This is a friendly match</span>
                            </div>
                        </div>
                        <div className="button-container">
                            <button className="btn btn-primary"
                                    onClick={this.showConfirmation}
                            >
                              Allow data usage
                            </button>
                        </div>
                    </div>
                }

                {this.state.confirmation &&
                    <form className="identity-form">
                        <h1>Enter your credentials</h1>
                        <div className="input-group control-input">
                            <label>EOS account name</label>
                            <input type="text" defaultValue={this.state.eosName} required={true} onChange={this.onChange} name="eosName" />
                        </div>
                        <div className="input-group control-input">
                            <label>EOS private key</label>
                            <input type="password" defaultValue={this.state.eosKey} required={true} onChange={this.onChange} name="eosKey" />
                        </div>
                        <div className="input-group control-input">
                            <label>Secret password</label>
                            <input type="password" defaultValue={this.state.password} required={true} onChange={this.onChange} name="password" />
                        </div>
                        <div className="button-container">
                            <button className="btn btn-primary"
                                    disabled={
                                        this.state.password.length === 0 ||
                                        this.state.eosKey.length === 0 ||
                                        this.state.eosName.length === 0
                                    }
                                    onClick={this.onSave}
                            >
                              Save
                            </button>
                        </div>
                    </form>
                }
            </div>
        );
    }
}

export default Decrypt;
