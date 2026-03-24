export class RandomNumberGenerator {
    private static readonly C0 = 0x40336050 >>> 0;
    private static readonly C1 = 0xCFA3723C >>> 0;
    private static readonly C2 = 0x3CAC5F6F >>> 0;
    private static readonly C3 = 0x3793FDFF >>> 0;

    private state = new Uint32Array(5);

    constructor(passiveSkill: { GraphIdentifier: number }, timelessJewel: { Seed: number }) {
        if (!timelessJewel) throw new Error("timelessJewel is null");

        const seeds = Uint32Array.from([
            passiveSkill.GraphIdentifier >>> 0,
            timelessJewel.Seed >>> 0
        ]);

        this.initialize(seeds);
    }

    private u32(x: number): number { return x >>> 0; }

    private static alpha(v: number): number {
        const x = (v ^ (v >>> 27)) >>> 0;
        return RandomNumberGenerator.mul32(x, 0x19660D);
    }

    private static mul32(a: number, b: number): number {
        a = a >>> 0;
        b = b >>> 0;
        let result = 0;
        while (b > 0) {
            if (b & 1) result = (result + a) >>> 0;
            a = (a << 1) >>> 0;
            b >>>= 1;
        }
        return result;
    }

    private static bravo(v: number): number {
        const x = (v ^ (v >>> 27)) >>> 0;
        return RandomNumberGenerator.mul32(x, 0x5D588B65);
    }

    public generate(exclusiveMax: number): number {
        const max = this.u32(exclusiveMax - 1);
        let roundState = 0 >>> 0;
        let value = 0 >>> 0;

        do {
            do {
                const rand = this.generateUInt();

                const rotated = (value << 1) >>> 0;
                value = (rand | rotated) >>> 0;

                const rsRotated = (roundState << 1) >>> 0;
                roundState = (0xFFFFFFFF | rsRotated) >>> 0;

            } while (roundState < max);

        } while (
            (Math.floor(value / exclusiveMax) >>> 0) >= roundState &&
            ((roundState % exclusiveMax) >>> 0) !== max
        );

        return (value % exclusiveMax) >>> 0;
    }

    public generateRange(min: number, max: number): number {
        let a = this.u32(min + 0x80000000);
        let b = this.u32(max + 0x80000000);

        if ((min >>> 0) >= 0x80000000) a = this.u32(min + 0x80000000);
        if ((max >>> 0) >= 0x80000000) b = this.u32(max + 0x80000000);

        const range = this.u32(b - a + 1);
        const roll = this.generate(range);
        return this.u32(roll + a - 0x80000000);
    }

    private initialize(seeds: Uint32Array): void {
        this.state[0] = 0;
        this.state[1] = RandomNumberGenerator.C0;
        this.state[2] = RandomNumberGenerator.C1;
        this.state[3] = RandomNumberGenerator.C2;
        this.state[4] = RandomNumberGenerator.C3;
        let index = 1;

        // Phase 1: seeds
        for (let i = 0; i < seeds.length; i++) {
            const idx1 = (index % 4) + 1;
            const idx2 = ((index + 1) % 4) + 1;
            const idx3 = (((index + 4) - 1) % 4) + 1;

            const rs = RandomNumberGenerator.alpha(
                this.state[idx1] ^ this.state[idx2] ^ this.state[idx3]
            );

            this.state[idx2] = this.u32(this.state[idx2] + rs);
            const temp = this.u32(rs + seeds[i] + index);
            this.state[((index + 1 + 1) % 4) + 1] = this.u32(this.state[((index + 1 + 1) % 4) + 1] + temp);
            this.state[idx1] = temp;
            index = (index + 1) % 4;
        }
        // Phase 2: 5 rounds
        for (let i = 0; i < 5; i++) {
            const idx1 = (index % 4) + 1;
            const idx2 = ((index + 1) % 4) + 1;
            const idx3 = (((index + 4) - 1) % 4) + 1;

            const rs = RandomNumberGenerator.alpha(
                this.state[idx1] ^ this.state[idx2] ^ this.state[idx3]
            );

            this.state[idx2] = this.u32(this.state[idx2] + rs);
            const temp = this.u32(rs + index);
            this.state[((index + 1 + 1) % 4) + 1] = this.u32(this.state[((index + 1 + 1) % 4) + 1] + temp);
            this.state[idx1] = temp;
            index = (index + 1) % 4;
        }
        // Phase 3: 4 rounds bravo
        for (let i = 0; i < 4; i++) {
            const idx1 = (index % 4) + 1;
            const idx2 = ((index + 1) % 4) + 1;
            const idx3 = (((index + 4) - 1) % 4) + 1;

            const sum = this.u32(this.state[idx1] + this.state[idx2] + this.state[idx3]);
            let rs = RandomNumberGenerator.bravo(sum);
            this.state[idx2] ^= rs;

            const temp = this.u32(rs - index);
            this.state[((index + 1 + 1) % 4) + 1] ^= temp;

            this.state[idx1] = temp;

            index = (index + 1) % 4;
        }
        // Phase 4: 8 warm-up
        for (let i = 0; i < 8; i++) {
            this.generateNextState();
        }
    }

    private generateNextState(): void {
        const a = this.state[4];
        const b = (this.state[1] & 0x7FFFFFFF) ^ this.state[2] ^ this.state[3];

        const na = a ^ ((a << 1) >>> 0);
        const nb = b ^ (((b >>> 1) ^ na) >>> 0);

        this.state[1] = this.state[2];
        this.state[2] = this.state[3];
        this.state[3] = (na ^ ((nb << 10) >>> 0)) >>> 0;
        this.state[4] = nb;

        const mask = (nb & 1) ? 0xFFFFFFFF : 0;
        this.state[2] ^= (mask & 0x8F7011EE) >>> 0;
        this.state[3] ^= (mask & 0xFC78FF1F) >>> 0;

        this.state[0] = this.u32(this.state[0] + 1);
    }

    private temper(): number {
        let a = this.state[4];
        let b = this.u32(this.state[1] + (this.state[3] >>> 8));
        a ^= b;
        if (b & 1) a ^= 0x3793FDFF;
        return a >>> 0;
    }

    private generateUInt(): number {
        this.generateNextState();
        return this.temper();
    }

    public getState(): Uint32Array {
        return new Uint32Array(this.state);
    }
}