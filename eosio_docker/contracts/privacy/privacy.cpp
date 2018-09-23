#include <eosiolib/eosio.hpp>
#include <eosiolib/print.hpp>
using namespace eosio;

class txcid : public eosio::contract {
   public:
      txcid( account_name s ):
         contract(s), // initialization of the base class for the contract
         _iidentities(s, s),
         _events(s, s),
         _subscribes(s, s)
      {
      }

      /// @abi action
      void createid(account_name owner, uint64_t uid, const std::string& location, const std::string& gender, const std::string& birthdate, const std::string& salt) {
         require_auth(owner);

         _iidentities.emplace(owner, [&](auto& idntty) {
            idntty.uid       = uid;
            idntty.location  = location;
            idntty.gender    = gender;
            idntty.birthdate = birthdate;
            idntty.salt      = salt;
         });
      }

      /// @abi action
      void createvent(account_name owner, uint64_t eid, const std::string& title) {
         require_auth(owner);

         _events.emplace(owner, [&](auto& vnt) {
            vnt.owner = owner;
            vnt.eid   = eid;
            vnt.title = title;
         });

         // potentially distribute reward here
      }

      /// @abi action
      void subscribe(account_name owner, uint64_t eventid, uint64_t id) {
         require_auth(owner);

         // check if event is present
         auto itr = _subscribes.find(eventid);
         if (itr == _subscribes.end()) {
            _subscribes.emplace(owner, [&](auto& vntid) {
               vntid.eventid = eventid;
               vntid.ids.push_back(id);
            });
         } else {
            _subscribes.modify(itr, owner, [&](auto& vntid) {
               vntid.ids.push_back(id);
            });
         }
         // potentially lock rewards from owner/organizer
      }

   private:
      /// @abi table iidentities
      struct identity {
         uint64_t uid;
         std::string  location;
         std::string  gender;
         std::string  birthdate;
         std::string  salt;

         uint64_t primary_key() const  { return uid; }
      };

      typedef eosio::multi_index<N(iidentities), identity> identity_table;

      identity_table _iidentities;

      /// @abi table events
      struct event {
         account_name owner;
         uint64_t eid;
         std::string  title;

         uint64_t primary_key() const  { return eid; }
      };

      typedef eosio::multi_index<N(events), event> event_table;

      event_table _events;

      /// @abi table subscribes
      struct subscriber {
         uint64_t eventid;
         vector<uint64_t> ids;

         uint64_t primary_key() const  { return eventid; }
      };

      typedef eosio::multi_index<N(subscribes), subscriber> subscriber_table;

      subscriber_table _subscribes;
};

EOSIO_ABI(txcid, (createid)(createvent)(subscribe))
