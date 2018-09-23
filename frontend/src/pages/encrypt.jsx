import React, { Component } from 'react';
import CryptoJS from 'crypto-js';
import Eos from 'eosjs';

// never do this except if you are writing hackathon spagetti code
const eosAccount = {
    name: 'testacc',
    key: '5JQdpdZmgaXuu9pWrUXAyZ77KjNvjNR8XrFzk51op38FzRtKqVV'
}

class Encrypt extends Component {
    constructor(props) {
        super(props);

        this.state = {
            birthdate: '',
            address: '',
            gender: 'male',
            salt: '1337',
            confirmation: false,
            password: '',
            chainIdentity: {}
        };

        this.onChange = this.onChange.bind(this);
        this.onIdentitySave = this.onIdentitySave.bind(this);
    }

    onChange(e) {
        const key = e.target.name;
        const state = Object.assign({}, this.state);
        state[key] = e.target.value;
        this.setState({
            ...state
        });
    }

    async onIdentitySave(e) {
        e.preventDefault();
        let chainIdentity = {};
        ["location", "gender", "salt", "birthdate"].map((key) => {
            chainIdentity[key] = CryptoJS.AES.encrypt(this.state[key], this.state.password).toString();
        });

        const uid = 1000 + Math.floor(Math.random()*1000);
        const eos = Eos({keyProvider: eosAccount.key});
        const result = await eos.transaction({
          actions: [{
            account: 'txcid',
            name: 'createid',
            authorization: [{
              actor: eosAccount.name,
              permission: 'active',
            }],
            data: {
                owner: eosAccount.name,
                uid,
                location: chainIdentity.location,
                gender: chainIdentity.gender,
                birthdate: chainIdentity.birthdate,
                salt: chainIdentity.salt
            }
          }],
        });

        localStorage.setItem('uid', uid);

        window.alert(`Identity saved! Your password: ${this.state.password}. DO NOT LOSE YOUR PASSWORD!`);
    }

    render() {
        return (
            <div className="encrypt">
                <h1>Encrypt your data</h1>
                <form className="identity-form">
                    <div className="input-group control-input">
                        <label>Date of birth</label>
                        <input type="text" defaultValue={this.state.birthdate} required={true} onChange={this.onChange} name="birthdate" />
                    </div>
                    <div className="input-group control-input">
                        <label>City and country</label>
                        <input type="text" defaultValue={this.state.address} required={true} onChange={this.onChange} name="address" />
                    </div>
                    <div className="input-group control-input">
                        <label>Gender</label>
                        <input type="text" defaultValue={this.state.gender} required={true} onChange={this.onChange} name="gender" />
                    </div>
                    <div className="input-group control-input">
                        <label>Encryption password</label>
                        <input type="password" defaultValue={this.state.password} required={true} onChange={this.onChange} name="password" />
                    </div>
                    <input type="hidden" value="1337" required={true} onChange={this.onChange} name="salt" />
                    <div className="button-container">
                        <button className="btn btn-primary"
                                disabled={
                                    this.state.gender.length === 0 ||
                                    this.state.address.length === 0 ||
                                    this.state.birthdate.length === 0
                                }
                                onClick={this.onIdentitySave}
                        >
                          Save
                        </button>
                    </div>
                </form>
            </div>
        );
    }
}

export default Encrypt;
