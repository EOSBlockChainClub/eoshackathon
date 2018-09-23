import React, { Component } from 'react';
import CryptoJS from 'crypto-js';
import Eos from 'eosjs';

class Encrypt extends Component {
    constructor(props) {
        super(props);

        this.state = {
            birthdate: '',
            address: '',
            gender: 'male',
            salt: '1337',
            eosName: '',
            eosKey: '',
            confirmation: false,
            password: '',
            chainIdentity: {}
        };

        this.onChange = this.onChange.bind(this);
        this.onIdentitySave = this.onIdentitySave.bind(this);
        this.onConfirm = this.onConfirm.bind(this);
    }

    onChange(e) {
        const key = e.target.name;
        const state = Object.assign({}, this.state);
        state[key] = e.target.value;
        this.setState({
            ...state
        });
    }

    onIdentitySave(e) {
        e.preventDefault();
        let chainIdentity = {};
        ["location", "gender", "salt", "birthdate"].map((key) => {
            chainIdentity[key] = CryptoJS.AES.encrypt(this.state[key], this.state.password).toString();
        });

        this.setState({
            confirmation: true,
            chainIdentity
        });
    }

    async onConfirm(e) {
        e.preventDefault();

        // TODO: push identity to chain and return password to user
        const uid = Math.floor(Math.random()*1000);
        const eos = Eos({keyProvider: this.state.eosKey});
        const result = await eos.transaction({
          actions: [{
            account: 'txcid',
            name: 'createid',
            authorization: [{
              actor: this.state.eosName,
              permission: 'active',
            }],
            data: {
                owner: this.state.eosName,
                uid,
                location: this.state.chainIdentity.location,
                gender: this.state.chainIdentity.gender,
                birthdate: this.state.chainIdentity.birthdate,
                salt: this.state.chainIdentity.salt
            }
          }],
        });

        console.log(result);

        localStorage.setItem('uid', uid);
        window.alert(`Identity saved! Your password: ${this.state.password}. DO NOT LOSE YOUR PASSWORD!`);
    }

    render() {
        return (
            <div>
                {this.state.confirmation &&
                    <form className="confirmation-form">
                        <h1>Enter your EOS information</h1>
                        <div className="input-group control-input">
                            <label>Account name</label>
                            <input type="text" defaultValue={this.state.eosName} required={true} onChange={this.onChange} name="eosName" />
                        </div>
                        <div className="input-group control-input">
                            <label>Private key</label>
                            <input type="password" defaultValue={this.state.eosKey} required={true} onChange={this.onChange} name="eosKey" />
                        </div>
                        <div className="button-container">
                            <button className="btn btn-primary"
                                    disabled={
                                        this.state.eosName.length === 0 ||
                                        this.state.eosKey.length === 0
                                    }
                                    onClick={this.onConfirm}
                            >
                              Save
                            </button>
                        </div>
                    </form>
                }
                {!this.state.confirmation &&
                    <div>
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
                }
            </div>
        );
    }
}

export default Encrypt;
