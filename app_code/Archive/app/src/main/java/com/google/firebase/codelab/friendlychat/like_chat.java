package com.google.firebase.codelab.friendlychat;

public class like_chat {
    private String partnerid;
    private String selfid;
    private String rate;
    private String _state;

    public  like_chat() {

    }

    public like_chat(String partnerid, String selfid, String rate) {
        this.partnerid = partnerid;
        this.selfid = selfid;
        this.rate = rate;
        this._state = "start_like_match";
    }

    public void setpartnerid(String matchId) {
        this.partnerid = matchId;
    }

    public void setSelfid(String selfid) {this.selfid = selfid;}

    public void setrate(String rate) {
        this.rate = rate;
    }

    public String getrate() {
        return rate;
    }

    public String getPartnerid() {
        return partnerid;
    }

    public String getSelfid() {
        return selfid;
    }
    public String get_state() { return _state;}

    public void set_state(String start) { this._state = start;}
}
