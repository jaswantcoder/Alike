package com.google.firebase.codelab.friendlychat;

public class miss_match {
    private String match;
    private String _state;

    public miss_match() {

    }

    public miss_match(String matchId) {
        this.match = matchId;
        this._state = "start_del_miss";
    }

    public String getmatch(){
        return match;
    }

    public String get_state() { return _state;}

    public void setMatch(String matchId) {
        this.match = matchId;
    }

    public void set_state(String start) { this._state = start;}
}

