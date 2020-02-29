"use strict";
const toObtainablePieces2 = {
    "黒兵": { color: "黒", prof: "兵" },
    "赤兵": { color: "赤", prof: "兵" },
    "黒弓": { color: "黒", prof: "弓" },
    "黒車": { color: "黒", prof: "車" },
    "黒虎": { color: "黒", prof: "虎" },
    "黒馬": { color: "黒", prof: "馬" },
    "黒筆": { color: "黒", prof: "筆" },
    "黒巫": { color: "黒", prof: "巫" },
    "黒将": { color: "黒", prof: "将" },
    "赤弓": { color: "赤", prof: "弓" },
    "赤車": { color: "赤", prof: "車" },
    "赤虎": { color: "赤", prof: "虎" },
    "赤馬": { color: "赤", prof: "馬" },
    "赤筆": { color: "赤", prof: "筆" },
    "赤巫": { color: "赤", prof: "巫" },
    "赤将": { color: "赤", prof: "将" },
    "黒王": { color: "黒", prof: "王" },
    "赤王": { color: "赤", prof: "王" },
    "黒船": { color: "黒", prof: "船" },
    "赤船": { color: "赤", prof: "船" }
};
const { calculate_hands_and_score_from_pieces, hand_to_score } = (() => {
    const toScore = {
        "無抗行処": 50,
        "同色無抗行処": 52,
        "筆兵無傾": 10,
        "同色筆兵無傾": 12,
        "地心": 7,
        "同色地心": 9,
        "馬弓兵": 5,
        "同色馬弓兵": 7,
        "行行": 5,
        "同色行行": 7,
        "王": 3 + 2,
        "獣": 3,
        "同色獣": 5,
        "戦集": 3,
        "同色戦集": 5,
        "助友": 3,
        "同色助友": 5,
        "闇戦之集": 3,
        "同色闇戦之集": 5,
        "皇再来": -3,
        "撃皇": -5
    };
    function calculate_hands_with_no_king(count) {
        function has(prof) {
            return count[prof]["赤"] + count[prof]["黒"] > 0;
        }
        function has_all(profs) {
            return profs.every(has);
        }
        function has_all_same_color(profs) {
            return profs.every(a => count[a]["赤"] >= 1) || profs.every(a => count[a]["黒"] >= 1);
        }
        function howmany(prof) {
            return count[prof]["赤"] + count[prof]["黒"];
        }
        let ans = new Set();
        if (count["兵"]["赤"] >= 5 || count["兵"]["黒"] >= 5) {
            ans.add("同色闇戦之集");
        }
        else if (howmany("兵") >= 5) {
            ans.add("闇戦之集");
        }
        if ((count["車"]["赤"] >= 1 && count["兵"]["赤"] >= 2)
            || (count["車"]["黒"] >= 1 && count["兵"]["黒"] >= 2)) {
            ans.add("同色助友");
        }
        else if (has("車") && howmany("兵") >= 2) {
            ans.add("助友");
        }
        if ((count["将"]["赤"] >= 1 && count["兵"]["赤"] >= 2)
            || (count["将"]["黒"] >= 1 && count["兵"]["黒"] >= 2)) {
            ans.add("同色戦集");
        }
        else if (has("将") && howmany("兵") >= 2) {
            ans.add("戦集");
        }
        const f = (arr, flashhand, hand) => {
            if (has_all_same_color(arr)) {
                ans.add(flashhand);
            }
            else if (has_all(arr)) {
                ans.add(hand);
            }
        };
        f(["虎", "馬"], "同色獣", "獣");
        f(["船", "車", "馬"], "同色行行", "行行");
        f(["兵", "弓", "馬"], "同色馬弓兵", "馬弓兵");
        f(["筆", "巫", "将"], "同色地心", "地心");
        f(["兵", "弓", "将", "筆", "巫"], "同色筆兵無傾", "筆兵無傾");
        return ans;
    }
    function calculate_hands_with_king(count) {
        function has(prof) {
            return count[prof]["赤"] + count[prof]["黒"] > 0;
        }
        function has_all(profs) {
            return profs.every(has);
        }
        function has_all_same_color(profs) {
            return profs.every(a => count[a]["赤"] >= 1) || profs.every(a => count[a]["黒"] >= 1);
        }
        let ans = new Set(["王"]);
        ans.add("王");
        const prof_list_excluding_king = [
            "兵", "弓", "車", "虎", "馬", "筆", "巫", "将", "船"
        ];
        if (has_all_same_color([...prof_list_excluding_king, "王"])) {
            ans.add("同色無抗行処");
        }
        else if (has_all([...prof_list_excluding_king, "王"])) {
            ans.add("無抗行処");
        }
        const f = (color) => {
            if (count["王"][color] === 1) {
                count["王"][color]--;
                for (let i = 0; i < prof_list_excluding_king.length; i++) {
                    count[prof_list_excluding_king[i]][color]++; // wildcard
                    ans = new Set([...ans, ...calculate_hands_(count)]);
                    count[prof_list_excluding_king[i]][color]--;
                }
                count["王"][color]++;
            }
        };
        f("赤");
        f("黒");
        const g = (flashhand, hand) => {
            if (ans.has(flashhand)) {
                ans.delete(hand);
            }
        };
        g("同色助友", "助友");
        g("同色地心", "地心");
        g("同色戦集", "戦集");
        g("同色馬弓兵", "馬弓兵");
        g("同色獣", "獣");
        g("同色行行", "行行");
        g("同色筆兵無傾", "筆兵無傾");
        g("同色闇戦之集", "闇戦之集");
        g("同色無抗行処", "無抗行処");
        return ans;
    }
    function calculate_hands_(count) {
        if (count["王"]["黒"] === 0 && count["王"]["赤"] === 0) {
            return calculate_hands_with_no_king(count);
        }
        else {
            return calculate_hands_with_king(count);
        }
    }
    function calculate_hands_from_pieces(ps) {
        const pieces = ps.map(a => toObtainablePieces2[a]);
        let count = {
            "兵": { "黒": 0, "赤": 0 },
            "弓": { "黒": 0, "赤": 0 },
            "車": { "黒": 0, "赤": 0 },
            "虎": { "黒": 0, "赤": 0 },
            "馬": { "黒": 0, "赤": 0 },
            "筆": { "黒": 0, "赤": 0 },
            "巫": { "黒": 0, "赤": 0 },
            "将": { "黒": 0, "赤": 0 },
            "王": { "黒": 0, "赤": 0 },
            "船": { "黒": 0, "赤": 0 },
        };
        for (let i = 0; i < pieces.length; i++) {
            count[pieces[i].prof][pieces[i].color]++;
        }
        // check if the input contains too many pieces
        let too_many_list = [];
        if (count["兵"]["黒"] > 8) {
            too_many_list.push("黒兵");
        }
        if (count["兵"]["赤"] > 8) {
            too_many_list.push("赤兵");
        }
        if (count["弓"]["黒"] > 2) {
            too_many_list.push("黒弓");
        }
        if (count["弓"]["赤"] > 2) {
            too_many_list.push("赤弓");
        }
        if (count["車"]["黒"] > 2) {
            too_many_list.push("黒車");
        }
        if (count["車"]["赤"] > 2) {
            too_many_list.push("赤車");
        }
        if (count["虎"]["黒"] > 2) {
            too_many_list.push("黒虎");
        }
        if (count["虎"]["赤"] > 2) {
            too_many_list.push("赤虎");
        }
        if (count["馬"]["黒"] > 2) {
            too_many_list.push("黒馬");
        }
        if (count["馬"]["赤"] > 2) {
            too_many_list.push("赤馬");
        }
        if (count["筆"]["黒"] > 2) {
            too_many_list.push("黒筆");
        }
        if (count["筆"]["赤"] > 2) {
            too_many_list.push("赤筆");
        }
        if (count["巫"]["黒"] > 2) {
            too_many_list.push("黒巫");
        }
        if (count["巫"]["赤"] > 2) {
            too_many_list.push("赤巫");
        }
        if (count["将"]["黒"] > 2) {
            too_many_list.push("黒将");
        }
        if (count["将"]["赤"] > 2) {
            too_many_list.push("赤将");
        }
        if (count["王"]["黒"] > 1) {
            too_many_list.push("黒王");
        }
        if (count["王"]["赤"] > 1) {
            too_many_list.push("赤王");
        }
        if (count["船"]["黒"] > 1) {
            too_many_list.push("黒船");
        }
        if (count["船"]["赤"] > 1) {
            too_many_list.push("赤船");
        }
        if (too_many_list.length > 0) {
            return { "too_many": too_many_list };
        }
        return [...calculate_hands_(count)];
    }
    function calculate_hands_and_score_from_pieces(ps) {
        const hands = calculate_hands_from_pieces(ps);
        if (Array.isArray(hands)) {
            return { "error": false, "score": hands.map(a => toScore[a]).reduce((a, b) => a + b, 0), "hands": hands };
        }
        else {
            return { "error": true, "too_many": hands.too_many };
        }
    }
    return { calculate_hands_and_score_from_pieces, hand_to_score: toScore };
})();
const generate_example = len => {
    let piece_list = ["黒兵", "黒兵", "黒兵", "黒兵", "黒兵", "黒兵", "黒兵", "黒兵", "赤兵", "赤兵", "赤兵", "赤兵", "赤兵", "赤兵", "赤兵", "赤兵", "黒弓", "黒車", "黒虎", "黒馬", "黒筆", "黒巫", "黒将", "黒弓", "黒車", "黒虎", "黒馬", "黒筆", "黒巫", "黒将", "赤弓", "赤車", "赤虎", "赤馬", "赤筆", "赤巫", "赤将", "赤弓", "赤車", "赤虎", "赤馬", "赤筆", "赤巫", "赤将", "黒王", "赤王", "黒船", "赤船"];
    // Fisher-Yates
    for (let i = piece_list.length - 1; i > 0; i--) {
        let j = Math.floor(Math.random() * (i + 1));
        [piece_list[i], piece_list[j]] = [piece_list[j], piece_list[i]];
    }
    return piece_list.slice(0, len);
};
if (typeof window === 'undefined') {
    module.exports = { calculate_hands_and_score_from_pieces, hand_to_score };
}
